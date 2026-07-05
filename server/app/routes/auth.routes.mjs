import { randomBytes } from 'node:crypto';
import { applySecurityHeaders } from '../../security-headers.mjs';
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  fetchGoogleProfile,
  isGoogleAuthEnabled,
} from '../../google-auth.mjs';

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
    readSessions,
    writeSessions,
    readPasswordResets,
    writePasswordResets,
    createSessionForUser,
    hashPassword,
    verifyPassword,
    invalidateSessionsForUser,
    parseCookies,
    SESSION_COOKIE,
    clearSessionCookie,
    createSessionCookie,
    SITE_URL,
    createGoogleOAuthState,
    consumeOAuthState,
    resolveGoogleUser,
    redirectWithSession,
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
    sendJson(res, 200, {
      enabled: isGoogleAuthEnabled(),
      startPath: '/api/access/google/start',
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/access/google/start') {
    if (!isGoogleAuthEnabled()) {
      sendJson(res, 503, { error: 'Google sign-in is not configured' });
      return true;
    }

    const limit = await authRateLimit(clientIp(req));
    if (!limit.allowed) {
      sendJson(res, 429, { error: t(lang, 'rateLimited') });
      return true;
    }

    const mode = url.searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
    const role = safeRole(url.searchParams.get('role'));
    const state = await createGoogleOAuthState({ mode, role });
    applySecurityHeaders(res);
    res.writeHead(302, { Location: buildGoogleAuthUrl(state) });
    res.end();
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/access/google/callback') {
    const code = safeText(url.searchParams.get('code'), 240);
    const stateToken = safeText(url.searchParams.get('state'), 120);
    const oauthState = stateToken ? await consumeOAuthState(stateToken) : null;
    const errorRedirect = `${SITE_URL.replace(/\/$/, '')}/access?google_auth=error`;

    if (!code || !oauthState || oauthState.kind !== 'google') {
      applySecurityHeaders(res);
      res.writeHead(302, { Location: errorRedirect });
      res.end();
      return true;
    }

    try {
      const tokenPayload = await exchangeGoogleCode(code);
      const profile = await fetchGoogleProfile(tokenPayload.access_token);
      const resolved = await resolveGoogleUser({
        profile,
        mode: oauthState.mode,
        role: oauthState.role,
      });

      if (resolved.error === 'no_account') {
        applySecurityHeaders(res);
        res.writeHead(302, { Location: `${SITE_URL.replace(/\/$/, '')}/create-account?google_auth=no_account` });
        res.end();
        return true;
      }

      if (resolved.error || !resolved.user) {
        applySecurityHeaders(res);
        res.writeHead(302, { Location: errorRedirect });
        res.end();
        return true;
      }

      const targetPath = resolved.user.householdId ? '/workspace' : '/household-setup';
      await redirectWithSession(res, req, resolved.user, targetPath);
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
      const sessions = await readSessions();
      await writeSessions(sessions.filter((entry) => entry.id !== sid));
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
    await invalidateSessionsForUser(match.userId);
    sendJson(res, 200, { ok: true });
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
      if (users.some((entry) => entry.email === email)) {
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
        fullName: safeText(body.fullName, 120) || 'T1D Member',
        role: safeRole(body.role),
        organization: safeText(body.organization, 120),
        createdAt: new Date().toISOString(),
      };
      users.push(nextUser);
      await writeUsers(users);

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

    const existing = users.find((entry) => entry.email === email);
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
