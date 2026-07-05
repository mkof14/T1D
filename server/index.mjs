import './load-env.mjs';
import http from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createDefaultSafetyState,
  ensureSafetyState,
} from './state-machine.mjs';
import {
  dexcomEnvConfig,
  ensureDexcomConnection,
  pollDexcom,
  pollDexcomLive,
  sealDexcomTokens,
} from './dexcom-service.mjs';
import { ensureDexcomOps } from './dexcom-ops.mjs';
import { startDexcomSyncWorker } from './sync-worker.mjs';
import { createStorage } from './storage.mjs';
import { applyAlertEvaluation } from './alert-engine.mjs';
import { createRateLimiter, clientIp } from './rate-limit.mjs';
import { requestLang, t } from './backend-i18n.mjs';
import { applySecurityHeaders } from './security-headers.mjs';
import { attachRequestContext } from './request-context.mjs';
import { defaultSafetyPreferences, normalizeDiabetesType } from './diabetes-type.mjs';
import { handleAlertTimelineRoutes } from './app/routes/alert-timeline.routes.mjs';
import { handleAuthRoutes } from './app/routes/auth.routes.mjs';
import { handleHouseholdRoutes } from './app/routes/household.routes.mjs';
import { handleDexcomRoutes } from './app/routes/dexcom.routes.mjs';
import { handleWorkspaceRoutes } from './app/routes/workspace.routes.mjs';
import { handleFeedbackRoutes } from './app/routes/feedback.routes.mjs';
import { handleSystemRoutes } from './app/routes/system.routes.mjs';
import { buildWorkspacePayloadForRequest } from './services/workspace-payload-service.mjs';
import { dualWritePollReadings } from './infrastructure/repositories/dual-write-service.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

const PORT = Number(process.env.T1D_API_PORT || 8790);
const BACKGROUND_SYNC_INTERVAL_MS = Number(process.env.T1D_BACKGROUND_SYNC_INTERVAL_MS || 15000);
let DATA_DIR = process.env.T1D_DATA_DIR || (process.env.VERCEL ? '/tmp/t1d-data' : path.join(__dirname, 'data'));
const storage = createStorage({ dataDirectory: DATA_DIR });
const readJson = (file, fallback) => storage.read(file, fallback);
const writeJson = (file, value) => storage.write(file, value);
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const HOUSEHOLDS_FILE = path.join(DATA_DIR, 'households.json');
const OAUTH_STATES_FILE = path.join(DATA_DIR, 'oauth-states.json');
const PASSWORD_RESETS_FILE = path.join(DATA_DIR, 'password-resets.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');
const SESSION_COOKIE = 't1d_sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const CRON_SECRET = String(process.env.T1D_CRON_SECRET || process.env.CRON_SECRET || '').trim();
const SITE_URL = String(process.env.T1D_SITE_URL || 'http://localhost:3002').trim();
const isProductionRuntime = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');
const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MIN_PASSWORD_LENGTH = 8;
const BODY_TOO_LARGE = Symbol('BODY_TOO_LARGE');

if (isProductionRuntime && process.env.T1D_EXPOSE_RESET_TOKEN === 'true') {
  console.error('[t1d-api] T1D_EXPOSE_RESET_TOKEN must not be enabled in production');
  process.exit(1);
}

const authRateLimit = createRateLimiter({ windowMs: 60_000, max: 12, keyPrefix: 'auth' });
const joinRateLimit = createRateLimiter({ windowMs: 60_000, max: 8, keyPrefix: 'join' });
const feedbackRateLimit = createRateLimiter({ windowMs: 60_000, max: 6, keyPrefix: 'feedback' });
const resetConfirmRateLimit = createRateLimiter({ windowMs: 60_000, max: 8, keyPrefix: 'reset-confirm' });
const SUPPORT_ACTIONS = new Set([
  'parent_handling',
  'parent_escalate',
  'parent_mark_with_adult',
  'caregiver_take_over',
  'caregiver_called_parent',
  'caregiver_on_way',
  'adult_self_monitor',
  'adult_treated_low',
  'adult_need_help',
  'adult_noting_high',
  'parent_noting_high',
  'all_ok',
  'DONE',
]);

const DEFAULT_ALLOWED_ORIGINS = isProductionRuntime
  ? []
  : [
      'http://localhost:3002',
      'http://127.0.0.1:3002',
      'http://localhost:4174',
      'http://127.0.0.1:4174',
      'http://localhost:3003',
      'http://127.0.0.1:3003',
    ];
const ENV_ALLOWED_ORIGINS = String(process.env.T1D_ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set([...DEFAULT_ALLOWED_ORIGINS, ...ENV_ALLOWED_ORIGINS]);

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const safeText = (value, max = 160) => String(value || '').trim().slice(0, max);
const safeRole = (value) => (['parent', 'adult', 'caregiver'].includes(value) ? value : 'parent');
const generateInviteCode = () => randomBytes(16).toString('hex').toUpperCase();

const safeEqualString = (leftValue, rightValue) => {
  const left = Buffer.from(String(leftValue));
  const right = Buffer.from(String(rightValue));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};

const isValidPassword = (password) => String(password || '').length >= MIN_PASSWORD_LENGTH;

const assertMutationOrigin = (req, res) => {
  if (!isProductionRuntime) return true;
  const origin = String(req.headers.origin || '');
  if (origin && ALLOWED_ORIGINS.has(origin)) return true;
  const referer = String(req.headers.referer || '');
  if (referer) {
    try {
      if (ALLOWED_ORIGINS.has(new URL(referer).origin)) return true;
    } catch {
      // ignore malformed referer
    }
  }
  sendJson(res, 403, { error: 'Origin not allowed' });
  return false;
};

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const target = Buffer.from(hash, 'hex');
  return candidate.length === target.length && timingSafeEqual(candidate, target);
};

const parseCookies = (cookieHeader = '') =>
  Object.fromEntries(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const index = entry.indexOf('=');
        if (index === -1) return [entry, ''];
        return [entry.slice(0, index), decodeURIComponent(entry.slice(index + 1))];
      })
  );

const isSecureRequest = (req) =>
  process.env.T1D_COOKIE_SECURE === 'true' ||
  req.headers['x-forwarded-proto'] === 'https' ||
  String(req.headers.origin || '').startsWith('https://');

const createSessionCookie = (token, req) =>
  `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${isSecureRequest(req) ? '; Secure' : ''}`;

const clearSessionCookie = () => `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

const sendJson = (res, status, payload, headers = {}) => {
  applySecurityHeaders(res);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

const sendEmpty = (res, status, headers = {}) => {
  applySecurityHeaders(res);
  res.writeHead(status, headers);
  res.end();
};

const readBody = async (req) => {
  const declaredLength = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return BODY_TOO_LARGE;
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) return BODY_TOO_LARGE;
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
};

const readHouseholds = async () => {
  const data = await readJson(HOUSEHOLDS_FILE, { households: [] });
  return Array.isArray(data.households) ? data.households.map(normalizeHouseholdRecord) : [];
};

const writeHouseholds = async (households) => writeJson(HOUSEHOLDS_FILE, { households: households.map(normalizeHouseholdRecord) });

const normalizeHouseholdRecord = (household) => {
  if (!household || typeof household !== 'object') return household;
  const safetyState = ensureSafetyState(household);
  const { nightState: _legacyNightState, ...rest } = household;
  const sealedDexcom = rest.dexcom ? sealDexcomTokens(ensureDexcomConnection({ dexcom: rest.dexcom })) : rest.dexcom;
  return {
    ...rest,
    diabetesType: normalizeDiabetesType(rest.diabetesType),
    safetyState,
    dexcom: sealedDexcom,
  };
};

const appendDexcomAudit = (household, event) => {
  const ops = ensureDexcomOps(household);
  return {
    ...household,
    dexcomOps: {
      ...ops,
      auditTrail: [
        {
          id: randomBytes(6).toString('hex'),
          time: new Date().toISOString(),
          ...event,
        },
        ...ops.auditTrail,
      ].slice(0, 24),
      lastSuccessAt: event.status === 'ok' ? new Date().toISOString() : ops.lastSuccessAt,
      lastFailureAt: event.status === 'error' ? new Date().toISOString() : ops.lastFailureAt,
      consecutiveFailures: event.status === 'ok' ? 0 : event.status === 'error' ? ops.consecutiveFailures + 1 : ops.consecutiveFailures,
      workerState: ops.workerState,
      nextWorkerRunAt: ops.nextWorkerRunAt,
      lastWorkerRunAt: ops.lastWorkerRunAt,
      pausedUntil: ops.pausedUntil,
    },
  };
};

const shouldRunBackgroundDexcomPoll = (household) => {
  const dexcom = ensureDexcomConnection(household);
  if (!dexcom || (dexcom.status !== 'connected' && dexcom.status !== 'error')) return false;
  if (!dexcom.nextPollDueAt) return false;
  const dueAt = Date.parse(dexcom.nextPollDueAt);
  return Number.isFinite(dueAt) && dueAt <= Date.now();
};

const applyDexcomPollToHousehold = async (household, source = 'manual') => {
  const previousReadings = ensureDexcomConnection(household).readings || [];
  const nextDexcom = dexcomEnvConfig().useLiveMode
    ? await pollDexcomLive(household)
    : pollDexcom(household);

  const polledHousehold = appendDexcomAudit({
    ...household,
    dexcom: nextDexcom,
    updatedAt: new Date().toISOString(),
  }, {
    kind: nextDexcom.status === 'error' ? 'error' : 'poll',
    status: nextDexcom.status === 'error' ? 'error' : nextDexcom.requestHealth === 'retrying' || nextDexcom.dataFreshness !== 'live' ? 'warning' : 'ok',
    headline: nextDexcom.status === 'error'
      ? t('en', 'dexcomPollFailed', source)
      : t('en', 'dexcomPollCompleted', source),
    detail: nextDexcom.message,
  });

  const { household: alertedHousehold } = applyAlertEvaluation(polledHousehold);
  const dualWriteResult = await dualWritePollReadings(
    alertedHousehold,
    previousReadings,
    ensureDexcomConnection(alertedHousehold).readings || [],
  );
  if (!dualWriteResult.ok && !dualWriteResult.skipped) {
    console.warn('[t1d-api] glucose dual-write failed', dualWriteResult.error);
  }
  return alertedHousehold;
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
    return { user };
  }

  const nextUser = {
    ...user,
    googleId: user.googleId || googleId,
    authProvider: user.authProvider || 'google',
    fullName: user.fullName || fullName,
  };
  await writeUsers(users.map((entry) => (entry.id === user.id ? nextUser : entry)));
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

const runBackgroundDexcomSync = async () => {
  const households = await readHouseholds();
  let changed = false;
  const nextHouseholds = await Promise.all(
    households.map(async (household) => {
      if (!shouldRunBackgroundDexcomPoll(household)) return household;
      changed = true;
      return applyDexcomPollToHousehold(household, 'background');
    })
  );
  if (changed) {
    await writeHouseholds(nextHouseholds);
  }
  return { processed: nextHouseholds.length, changed };
};

const readUsers = async () => {
  const data = await readJson(USERS_FILE, { users: [] });
  return Array.isArray(data.users) ? data.users : [];
};

const writeUsers = async (users) => writeJson(USERS_FILE, { users });

const updateUser = async (userId, patch) => {
  const users = await readUsers();
  const nextUsers = users.map((entry) => (entry.id === userId ? { ...entry, ...patch } : entry));
  await writeUsers(nextUsers);
  return nextUsers.find((entry) => entry.id === userId) || null;
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
};

const withCors = (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : null;
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
};

const findSessionUser = async (req) => {
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

const buildRouteContext = (req, res, url, lang) => ({
  req,
  res,
  url,
  lang,
  sendJson,
  readBody,
  BODY_TOO_LARGE,
  findSessionUser,
  readHouseholds,
  writeHouseholds,
  updateUser,
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
  isProductionRuntime,
  authRateLimit,
  joinRateLimit,
  resetConfirmRateLimit,
  clientIp,
  t,
  normalizeEmail,
  safeText,
  safeRole,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  generateInviteCode,
  normalizeDiabetesType,
  defaultSafetyPreferences,
  createDefaultSafetyState,
  buildWorkspacePayloadForRequest,
  createGoogleOAuthState,
  consumeOAuthState,
  resolveGoogleUser,
  redirectWithSession,
  createOAuthState,
  appendDexcomAudit,
  applyDexcomPollToHousehold,
  feedbackRateLimit,
  DATA_DIR,
  FEEDBACK_FILE,
  SUPPORT_ACTIONS,
  readJson,
  writeJson,
  safeEqualString,
  CRON_SECRET,
  runBackgroundDexcomSync,
});

export const handleRequest = async (req, res) => {
  withCors(req, res);
  attachRequestContext(req, res);

  if (req.method === 'OPTIONS') {
    sendEmpty(res, 204);
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const lang = requestLang(req);

  if (req.method === 'POST' && !assertMutationOrigin(req, res)) {
    return;
  }

  if (await handleSystemRoutes(buildRouteContext(req, res, url, lang))) return;

  const routeCtx = buildRouteContext(req, res, url, lang);
  if (await handleDexcomRoutes(routeCtx)) return;
  if (await handleAuthRoutes(routeCtx)) return;
  if (await handleHouseholdRoutes(routeCtx)) return;
  if (await handleWorkspaceRoutes(routeCtx)) return;
  if (await handleFeedbackRoutes(routeCtx)) return;

  if (await handleAlertTimelineRoutes({
    req,
    res,
    url,
    lang,
    findSessionUser,
    readHouseholds,
    writeHouseholds,
    sendJson,
    readBody,
    BODY_TOO_LARGE,
  })) {
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
};

const server = http.createServer(handleRequest);

if (isDirectRun) {
  server.listen(PORT, () => {
    console.log(`[t1d-api] listening on http://localhost:${PORT}`);
  });

  startDexcomSyncWorker({
    intervalMs: BACKGROUND_SYNC_INTERVAL_MS,
    readHouseholds,
    writeHouseholds,
    shouldRunBackgroundDexcomPoll,
    applyDexcomPollToHousehold,
    appendDexcomAudit,
    logger: console,
  });
}
