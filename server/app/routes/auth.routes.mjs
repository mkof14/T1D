import { randomBytes } from 'node:crypto';
import { applySecurityHeaders } from '../../security-headers.mjs';
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleProfile,
  googleAuthConfig,
  googleJavascriptOrigins,
  isGoogleAuthEnabled,
  isGoogleRedirectFlowEnabled,
  resolveGoogleRedirectUri,
  verifyGoogleIdToken,
} from '../../google-auth.mjs';
import { findUserByEmailFromSql, isSqlReadEnabled } from '../../infrastructure/repositories/sql-read-service.mjs';
import { dualWriteDeleteUser, dualWriteRevokeSessionsForUser } from '../../infrastructure/repositories/dual-write-service.mjs';
import { provisionDefaultHouseholdForUser } from '../../services/provision-default-household.mjs';

export const handleAuthRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    lang,
    sendJson,
    readBody,
    BODY_TOO_LARGE,
    findSessionUser,
    authRateLimit,
    resetConfirmRateLimit,
    clientIp,
    t,
    normalizeEmail,
    safeText,
    safeRole,
    isValidPassword,
    MIN_PASSWORD_LENGTH,
    readUsers,
    writeUsers,
    mirrorUsersToSql,
    readSessions,
    writeSessions,
    readPasswordResets,
    writePasswordResets,
    createSessionForUser,
    hashPassword,
    verifyPassword,
    invalidateSessionsForUser,
    removeSession,
    parseCookies,
    SESSION_COOKIE,
    clearSessionCookie,
    createSessionCookie,
    SITE_URL,
    createGoogleOAuthState,
    consumeOAuthState,
    resolveGoogleUser,
    redirectWithSession,
    readHouseholds,
    writeHouseholds,
    persistHouseholdRecord,
    updateUser,
    normalizeDiabetesType,
    defaultSafetyPreferences,
    createDefaultSafetyState,
    generateInviteCode,
  } = ctx;

  const parseDiabetesType = (value) => (value === 'type2' ? 'type2' : 'type1');

  const ensureUserHousehold = async (user, diabetesType) => {
    if (!user?.id) return user;
    return provisionDefaultHouseholdForUser({
      user,
      diabetesType: parseDiabetesType(diabetesType),
      readHouseholds,
      persistHouseholdRecord,
      updateUser,
      normalizeDiabetesType,
      defaultSafetyPreferences,
      createDefaultSafetyState,
      generateInviteCode,
    });
  };

  const sessionUserPayload = (user) => ({
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    organization: user.organization || '',
  });

  const finishAuthSession = async (req, res, user, diabetesType, status = 200) => {
    const withHousehold = await ensureUserHousehold(user, diabetesType);
    const nextSession = await createSessionForUser(withHousehold.id);
    sendJson(res, status, {
      user: sessionUserPayload(withHousehold),
      householdReady: Boolean(withHousehold.householdId),
    }, {
      'Set-Cookie': createSessionCookie(nextSession.id, req),
    });
    return true;
  };

  if (req.method === 'GET' && url.pathname === '/api/session') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 200, { authenticated: false });
      return true;
    }
    sendJson(res, 200, {
      authenticated: true,
      user: {
        email: current.user.email,
        fullName: current.user.fullName,
        role: current.user.role,
        organization: current.user.organization || '',
      },
    });
    return true;
  }

  const completeGoogleSignIn = async (req, res, resolved, diabetesType = 'type1') => {
    if (resolved.error === 'no_account') {
      sendJson(res, 409, { error: 'no_account' });
      return true;
    }

    if (resolved.error || !resolved.user) {
      sendJson(res, 401, { error: 'Google sign-in failed' });
      return true;
    }

    return finishAuthSession(req, res, resolved.user, diabetesType);
  };

  if (req.method === 'GET' && url.pathname === '/api/access/google/status') {
    const { clientId } = googleAuthConfig();
    sendJson(res, 200, {
      enabled: isGoogleAuthEnabled(),
      flow: 'google-identity-services',
      clientId: isGoogleAuthEnabled() ? clientId : '',
      javascriptOrigins: googleJavascriptOrigins(),
      setupHint: 'Add javascriptOrigins to your Web application OAuth client in Google Cloud Console.',
    });
    return true;
  }

  const handleGoogleCredentialSignIn = async (body) => {
    const credential = safeText(body?.credential, 8192);
    const mode = body?.mode === 'signup' ? 'signup' : 'signin';
    const role = safeRole(body?.role);
    if (!credential) {
      sendJson(res, 400, { error: 'Missing Google credential' });
      return true;
    }

    const diabetesType = parseDiabetesType(body?.diabetesType);

    try {
      const profile = await verifyGoogleIdToken(credential);
      const resolved = await resolveGoogleUser({ profile, mode, role });
      return completeGoogleSignIn(req, res, resolved, diabetesType);
    } catch {
      sendJson(res, 401, { error: 'Invalid Google credential' });
      return true;
    }
  };

  if (req.method === 'POST' && (url.pathname === '/api/access/google/signin' || url.pathname === '/api/access/google/credential')) {
    if (!isGoogleAuthEnabled()) {
      sendJson(res, 503, { error: 'Google sign-in is not configured' });
      return true;
    }

    const limit = await authRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const body = await readBody(req);
    return handleGoogleCredentialSignIn(body);
  }

  if (req.method === 'GET' && url.pathname === '/api/access/google/start') {
    if (!isGoogleRedirectFlowEnabled()) {
      sendJson(res, 503, { error: 'Google redirect sign-in is not configured' });
      return true;
    }

    const limit = await authRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const mode = url.searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
    const role = safeRole(url.searchParams.get('role'));
    const redirectUri = resolveGoogleRedirectUri(req, url.searchParams.get('origin') || '');
    const diabetesType = parseDiabetesType(url.searchParams.get('type'));
    const state = await createGoogleOAuthState({ mode, role, redirectUri, diabetesType });
    applySecurityHeaders(res);
    res.writeHead(302, { Location: buildGoogleAuthUrl(state, redirectUri) });
    res.end();
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/access/google/callback') {
    const code = safeText(url.searchParams.get('code'), 240);
    const stateToken = safeText(url.searchParams.get('state'), 120);
    const oauthState = stateToken ? await consumeOAuthState(stateToken) : null;
    const redirectUri = oauthState?.redirectUri || resolveGoogleRedirectUri(req);
    const siteBase = (() => {
      try {
        return new URL(redirectUri).origin;
      } catch {
        return SITE_URL.replace(/\/$/, '');
      }
    })();
    const errorRedirect = `${siteBase}/access?google_auth=error`;

    if (!code || !oauthState || oauthState.kind !== 'google') {
      applySecurityHeaders(res);
      res.writeHead(302, { Location: errorRedirect });
      res.end();
      return true;
    }

    try {
      const tokenPayload = await exchangeGoogleCode(code, redirectUri);
      const profile = await fetchGoogleProfile(tokenPayload.access_token);
      const resolved = await resolveGoogleUser({
        profile,
        mode: oauthState.mode,
        role: oauthState.role,
      });

      if (resolved.error === 'no_account') {
        applySecurityHeaders(res);
        res.writeHead(302, { Location: `${siteBase}/create-account?google_auth=no_account` });
        res.end();
        return true;
      }

      if (resolved.error || !resolved.user) {
        applySecurityHeaders(res);
        res.writeHead(302, { Location: errorRedirect });
        res.end();
        return true;
      }

      const withHousehold = await ensureUserHousehold(resolved.user, oauthState.diabetesType);
      await redirectWithSession(res, req, withHousehold, '/workspace', siteBase);
    } catch {
      applySecurityHeaders(res);
      res.writeHead(302, { Location: errorRedirect });
      res.end();
    }
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/access/signout') {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[SESSION_COOKIE];
    if (sid) {
      await removeSession(sid);
    }
    sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/access/password-reset/request') {
    const limit = await authRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const body = await readBody(req);
    const email = normalizeEmail(body?.email);
    if (!email) {
      sendJson(res, 400, { error: 'Email is required' });
      return true;
    }

    const users = await readUsers();
    const user = users.find((entry) => entry.email === email);
    if (user) {
      const tokens = await readPasswordResets();
      const token = randomBytes(18).toString('hex');
      tokens.push({
        token,
        userId: user.id,
        email,
        expiresAt: Date.now() + 1000 * 60 * 60,
      });
      await writePasswordResets(tokens.slice(-200));
    }

    sendJson(res, 200, {
      ok: true,
      message: t(lang, 'passwordResetSent'),
      resetToken: process.env.T1D_EXPOSE_RESET_TOKEN === 'true' && user
        ? (await readPasswordResets()).find((entry) => entry.email === email)?.token
        : undefined,
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/access/password-reset/confirm') {
    const limit = await resetConfirmRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const body = await readBody(req);
    if (body === BODY_TOO_LARGE) {
      sendJson(res, 413, { error: 'Request body too large' });
      return true;
    }
    const token = safeText(body?.token, 120);
    const password = safeText(body?.password, 200);
    if (!token || !password) {
      sendJson(res, 400, { error: 'Token and password are required' });
      return true;
    }
    if (!isValidPassword(password)) {
      sendJson(res, 400, { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return true;
    }

    const tokens = await readPasswordResets();
    const matchIndex = tokens.findIndex((entry) => entry.token === token);
    if (matchIndex === -1) {
      sendJson(res, 400, { error: t(lang, 'invalidResetToken') });
      return true;
    }

    const [match] = tokens.splice(matchIndex, 1);
    await writePasswordResets(tokens);
    const users = await readUsers();
    const nextUsers = users.map((entry) =>
      entry.id === match.userId ? { ...entry, passwordHash: hashPassword(password) } : entry
    );
    await writeUsers(nextUsers);
    mirrorUsersToSql([nextUsers.find((entry) => entry.id === match.userId)].filter(Boolean));
    await invalidateSessionsForUser(match.userId);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/account/delete') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (body === BODY_TOO_LARGE) {
      sendJson(res, 413, { error: 'Request body too large' });
      return true;
    }

    const requiresPassword = Boolean(current.user.passwordHash);
    if (requiresPassword) {
      const password = safeText(body?.password, 200);
      if (!password || !verifyPassword(password, current.user.passwordHash)) {
        sendJson(res, 401, { error: 'Password is incorrect' });
        return true;
      }
    } else if (body?.confirm !== true) {
      sendJson(res, 400, { error: 'Confirmation is required' });
      return true;
    }

    const users = await readUsers();
    const nextUsers = users.filter((entry) => entry.id !== current.user.id);
    await writeUsers(nextUsers);
    await invalidateSessionsForUser(current.user.id);

    const households = await readHouseholds();
    const nextHouseholds = households.map((household) => {
      if (household.id !== current.user.householdId) return household;
      const members = Array.isArray(household.members)
        ? household.members.filter((member) => member.email !== current.user.email)
        : household.members;
      return {
        ...household,
        members,
        updatedAt: new Date().toISOString(),
      };
    });
    await writeHouseholds(nextHouseholds);

    void dualWriteDeleteUser(current.user.id).then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn('[t1d-api] user delete dual-write failed', result.error);
      }
    });
    void dualWriteRevokeSessionsForUser(current.user.id);

    sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    return true;
  }

  if (req.method === 'POST' && (url.pathname === '/api/access/signin' || url.pathname === '/api/access/signup')) {
    const limit = await authRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }

    const email = normalizeEmail(body.email);
    const password = safeText(body.password, 200);
    if (!email || !password) {
      sendJson(res, 400, { error: 'Email and password are required' });
      return true;
    }

    const users = await readUsers();

    if (url.pathname === '/api/access/signup') {
      const sqlExisting = isSqlReadEnabled() ? await findUserByEmailFromSql(email) : null;
      if (users.some((entry) => entry.email === email) || sqlExisting) {
        sendJson(res, 409, { error: 'Unable to create account with these details' });
        return true;
      }
      if (!isValidPassword(password)) {
        sendJson(res, 400, { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        return true;
      }
      const nextUser = {
        id: randomBytes(12).toString('hex'),
        email,
        passwordHash: hashPassword(password),
        fullName: safeText(body.fullName, 120) || 'Steady Member',
        role: safeRole(body.role),
        organization: safeText(body.organization, 120),
        createdAt: new Date().toISOString(),
      };
      users.push(nextUser);
      await writeUsers(users);
      mirrorUsersToSql([nextUser]);

      return finishAuthSession(req, res, nextUser, body.diabetesType, 201);
    }

    let existing = users.find((entry) => entry.email === email);
    if (!existing && isSqlReadEnabled()) {
      existing = await findUserByEmailFromSql(email);
    }
    if (!existing || !existing.passwordHash || !verifyPassword(password, existing.passwordHash)) {
      sendJson(res, 401, { error: 'Email or password is incorrect' });
      return true;
    }

    const withHousehold = await ensureUserHousehold(existing, body.diabetesType);
    return finishAuthSession(req, res, withHousehold, body.diabetesType);
  }

  return false;
};
