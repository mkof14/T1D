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
import { createAuthStorage } from './services/auth-storage.mjs';
import { dualWritePollReadings, dualWriteHouseholdSnapshot } from './infrastructure/repositories/dual-write-service.mjs';

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

const authStorage = createAuthStorage({
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
});

const {
  readUsers,
  writeUsers,
  updateUser,
  readSessions,
  writeSessions,
  invalidateSessionsForUser,
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
  mirrorUsersToSql,
} = authStorage;

const findSessionUser = async (req) => authStorage.findSessionUser(req, parseCookies);

const mirrorHouseholdToSql = (household) => {
  void dualWriteHouseholdSnapshot(household).then((result) => {
    if (!result.ok && !result.skipped) {
      console.warn('[t1d-api] household dual-write failed', result.error);
    }
  });
};

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
  mirrorHouseholdToSql,
  updateUser,
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
