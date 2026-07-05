import { randomBytes } from 'node:crypto';
import { applySecurityHeaders } from '../security-headers.mjs';
import { dualWriteUser, dualWriteSession, dualWriteRevokeSession, dualWriteRevokeSessionsForUser } from '../infrastructure/repositories/dual-write-service.mjs';

export const createAuthStorage = ({
  readJson,
  writeJson,
  USERS_FILE,
  SESSIONS_FILE,
  OAUTH_STATES_FILE,
  PASSWORD_RESETS_FILE,
  SESSION_TTL_MS,
  SESSION_COOKIE,
  SITE_URL,
  createSessionCookie,
  normalizeEmail,
  safeText,
  safeRole,
}) => {
  const readUsers = async () => {
    const data = await readJson(USERS_FILE, { users: [] });
    return Array.isArray(data.users) ? data.users : [];
  };

  const writeUsers = async (users) => {
    await writeJson(USERS_FILE, { users });
  };

  const mirrorUsersToSql = (users = []) => {
    for (const user of users) {
      void dualWriteUser(user).then((result) => {
        if (!result.ok && !result.skipped) {
          console.warn('[t1d-api] user dual-write failed', result.error);
        }
      });
    }
  };

  const mirrorSessionToSql = (session) => {
    void dualWriteSession(session).then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn('[t1d-api] session dual-write failed', result.error);
      }
    });
  };

  const mirrorRevokeSessionToSql = (sessionId) => {
    void dualWriteRevokeSession(sessionId).then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn('[t1d-api] session revoke failed', result.error);
      }
    });
  };

  const mirrorRevokeSessionsForUserToSql = (userId) => {
    void dualWriteRevokeSessionsForUser(userId).then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn('[t1d-api] session revoke failed', result.error);
      }
    });
  };

  const updateUser = async (userId, patch) => {
    const users = await readUsers();
    const nextUsers = users.map((entry) => (entry.id === userId ? { ...entry, ...patch } : entry));
    await writeUsers(nextUsers);
    const updated = nextUsers.find((entry) => entry.id === userId) || null;
    if (updated) mirrorUsersToSql([updated]);
    return updated;
  };

  const readSessions = async () => {
    const data = await readJson(SESSIONS_FILE, { sessions: [] });
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    const now = Date.now();
    const active = sessions.filter((session) => session.expiresAt > now);
    if (active.length !== sessions.length) {
      await writeJson(SESSIONS_FILE, { sessions: active });
    }
    return active;
  };

  const writeSessions = async (sessions) => writeJson(SESSIONS_FILE, { sessions });

  const invalidateSessionsForUser = async (userId) => {
    const sessions = await readSessions();
    await writeSessions(sessions.filter((session) => session.userId !== userId));
    mirrorRevokeSessionsForUserToSql(userId);
  };

  const removeSession = async (sessionId) => {
    const sessions = await readSessions();
    await writeSessions(sessions.filter((session) => session.id !== sessionId));
    mirrorRevokeSessionToSql(sessionId);
  };

  const readOAuthStates = async () => {
    const data = await readJson(OAUTH_STATES_FILE, { states: [] });
    const now = Date.now();
    const states = Array.isArray(data.states) ? data.states.filter((entry) => entry.expiresAt > now) : [];
    if (states.length !== (data.states || []).length) {
      await writeJson(OAUTH_STATES_FILE, { states });
    }
    return states;
  };

  const writeOAuthStates = async (states) => writeJson(OAUTH_STATES_FILE, { states });

  const createOAuthState = async (householdId, userId = '') => {
    const token = randomBytes(12).toString('hex');
    const states = await readOAuthStates();
    states.push({
      token,
      householdId,
      userId: safeText(userId, 120),
      expiresAt: Date.now() + 1000 * 60 * 15,
    });
    await writeOAuthStates(states.slice(-100));
    return token;
  };

  const consumeOAuthState = async (token) => {
    const states = await readOAuthStates();
    const matchIndex = states.findIndex((entry) => entry.token === token);
    if (matchIndex === -1) return null;
    const [match] = states.splice(matchIndex, 1);
    await writeOAuthStates(states);
    return match;
  };

  const createGoogleOAuthState = async ({ mode, role }) => {
    const token = randomBytes(12).toString('hex');
    const states = await readOAuthStates();
    states.push({
      token,
      kind: 'google',
      mode: mode === 'signup' ? 'signup' : 'signin',
      role: safeRole(role),
      expiresAt: Date.now() + 1000 * 60 * 15,
    });
    await writeOAuthStates(states.slice(-100));
    return token;
  };

  const createSessionForUser = async (userId) => {
    const sessions = await readSessions();
    const nextSession = {
      id: randomBytes(18).toString('hex'),
      userId,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessions.push(nextSession);
    await writeSessions(sessions);
    mirrorSessionToSql(nextSession);
    return nextSession;
  };

  const redirectWithSession = async (res, req, user, targetPath) => {
    const nextSession = await createSessionForUser(user.id);
    applySecurityHeaders(res);
    res.writeHead(302, {
      Location: `${SITE_URL.replace(/\/$/, '')}${targetPath}`,
      'Set-Cookie': createSessionCookie(nextSession.id, req),
    });
    res.end();
  };

  const resolveGoogleUser = async ({ profile, mode, role }) => {
    const email = normalizeEmail(profile.email);
    const googleId = safeText(profile.sub, 120);
    const fullName = safeText(profile.name, 120) || email.split('@')[0] || 'T1D Member';

    if (!email || !googleId || profile.email_verified === false) {
      return { error: 'invalid_profile' };
    }

    const users = await readUsers();
    let user = users.find((entry) => entry.googleId === googleId) || users.find((entry) => entry.email === email);

    if (!user && mode === 'signin') {
      return { error: 'no_account' };
    }

    if (!user) {
      user = {
        id: randomBytes(12).toString('hex'),
        email,
        fullName,
        googleId,
        authProvider: 'google',
        role: safeRole(role),
        organization: '',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      await writeUsers(users);
      mirrorUsersToSql([user]);
      return { user };
    }

    const nextUser = {
      ...user,
      googleId: user.googleId || googleId,
      authProvider: user.authProvider || 'google',
      fullName: user.fullName || fullName,
    };
    await writeUsers(users.map((entry) => (entry.id === user.id ? nextUser : entry)));
    mirrorUsersToSql([nextUser]);
    return { user: nextUser };
  };

  const readPasswordResets = async () => {
    const data = await readJson(PASSWORD_RESETS_FILE, { tokens: [] });
    const now = Date.now();
    const tokens = Array.isArray(data.tokens) ? data.tokens.filter((entry) => entry.expiresAt > now) : [];
    if (tokens.length !== (data.tokens || []).length) {
      await writeJson(PASSWORD_RESETS_FILE, { tokens });
    }
    return tokens;
  };

  const writePasswordResets = async (tokens) => writeJson(PASSWORD_RESETS_FILE, { tokens });

  const findSessionUser = async (req, parseCookies) => {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[SESSION_COOKIE];
    if (!sid) return null;
    const sessions = await readSessions();
    const session = sessions.find((entry) => entry.id === sid);
    if (!session) return null;
    const users = await readUsers();
    const user = users.find((entry) => entry.id === session.userId);
    if (!user) return null;
    return { session, user };
  };

  return {
    readUsers,
    writeUsers,
    mirrorUsersToSql,
    updateUser,
    readSessions,
    writeSessions,
    invalidateSessionsForUser,
    removeSession,
    readOAuthStates,
    writeOAuthStates,
    createOAuthState,
    consumeOAuthState,
    createGoogleOAuthState,
    createSessionForUser,
    redirectWithSession,
    resolveGoogleUser,
    readPasswordResets,
    writePasswordResets,
    findSessionUser,
  };
};
