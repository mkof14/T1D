import { randomBytes } from 'node:crypto';
import {
  googleAuthConfig,
  googleJavascriptOrigins,
  isGoogleAuthEnabled,
  verifyGoogleIdToken,
} from '../../google-auth.mjs';
import { findUserByEmailFromSql, isSqlReadEnabled } from '../../infrastructure/repositories/sql-read-service.mjs';
import { dualWriteDeleteUser, dualWriteRevokeSessionsForUser } from '../../infrastructure/repositories/dual-write-service.mjs';

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
    resolveGoogleUser,
    readHouseholds,
    writeHouseholds,
  } = ctx;

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

  if (req.method === 'POST' && url.pathname === '/api/access/google/signin') {
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
    const credential = safeText(body?.credential, 8192);
    const mode = body?.mode === 'signup' ? 'signup' : 'signin';
    const role = safeRole(body?.role);

    if (!credential) {
      sendJson(res, 400, { error: 'Missing Google credential' });
      return true;
    }

    try {
      const profile = await verifyGoogleIdToken(credential);
      const resolved = await resolveGoogleUser({ profile, mode, role });

      if (resolved.error === 'no_account') {
        sendJson(res, 404, { error: 'no_account' });
        return true;
      }

      if (resolved.error || !resolved.user) {
        sendJson(res, 401, { error: 'Google sign-in failed' });
        return true;
      }

      const nextSession = await createSessionForUser(resolved.user.id);
      sendJson(res, 200, {
        user: {
          email: resolved.user.email,
          fullName: resolved.user.fullName,
          role: resolved.user.role,
          organization: resolved.user.organization || '',
        },
        householdReady: Boolean(resolved.user.householdId),
      }, {
        'Set-Cookie': createSessionCookie(nextSession.id, req),
      });
    } catch {
      sendJson(res, 401, { error: 'Invalid Google credential' });
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

      const nextSession = await createSessionForUser(nextUser.id);

      sendJson(
        res,
        201,
        {
          user: {
            email: nextUser.email,
            fullName: nextUser.fullName,
            role: nextUser.role,
            organization: nextUser.organization,
          },
        },
        { 'Set-Cookie': createSessionCookie(nextSession.id, req) }
      );
      return true;
    }

    let existing = users.find((entry) => entry.email === email);
    if (!existing && isSqlReadEnabled()) {
      existing = await findUserByEmailFromSql(email);
    }
    if (!existing || !existing.passwordHash || !verifyPassword(password, existing.passwordHash)) {
      sendJson(res, 401, { error: 'Email or password is incorrect' });
      return true;
    }

    const nextSession = await createSessionForUser(existing.id);
    sendJson(
      res,
      200,
      {
        user: {
          email: existing.email,
          fullName: existing.fullName,
          role: existing.role,
          organization: existing.organization || '',
        },
      },
      { 'Set-Cookie': createSessionCookie(nextSession.id, req) }
    );
    return true;
  }

  return false;
};
