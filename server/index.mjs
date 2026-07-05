import './load-env.mjs';
import http from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  actionSetByRole,
  createDefaultSafetyState,
  currentStateForRole,
  deviceStatusForStage,
  ensureSafetyState,
  notificationFeedForStage,
  notificationSummaryForStage,
  timelineForStage,
} from './state-machine.mjs';
import {
  dexcomPayloadForHousehold,
  dexcomEnvConfig,
  ensureDexcomConnection,
  pollDexcom,
  pollDexcomLive,
  sealDexcomTokens,
} from './dexcom-service.mjs';
import { startDexcomSyncWorker } from './sync-worker.mjs';
import { createStorage, getStorageBackend, getStorageProbeError, probeStorage } from './storage.mjs';
import { applyAlertEvaluation } from './alert-engine.mjs';
import { createRateLimiter, clientIp, isUpstashRateLimitEnabled } from './rate-limit.mjs';
import { requestLang, t } from './backend-i18n.mjs';
import { localizeWorkspacePayload } from './workspace-i18n.mjs';
import { applySecurityHeaders } from './security-headers.mjs';
import { attachRequestContext } from './request-context.mjs';
import { defaultSafetyPreferences, normalizeDiabetesType } from './diabetes-type.mjs';
import { buildNutritionPayload } from './nutrition-service.mjs';
import { handleAlertTimelineRoutes } from './app/routes/alert-timeline.routes.mjs';
import { handleAuthRoutes } from './app/routes/auth.routes.mjs';
import { handleHouseholdRoutes } from './app/routes/household.routes.mjs';
import { handleDexcomRoutes } from './app/routes/dexcom.routes.mjs';
import { handleWorkspaceRoutes } from './app/routes/workspace.routes.mjs';
import { handleFeedbackRoutes } from './app/routes/feedback.routes.mjs';
import { ALERT_RULE_VERSION } from './domain/alerts/alert-rules.mjs';
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

const buildHouseholdMembers = (household, fallbackParent, fallbackCaregiver) => {
  const members = Array.isArray(household.members) ? household.members : [];
  return members.map((member, index) => ({
    id: member.id || `member-${index}`,
    fullName: member.fullName || (member.role === 'parent' ? fallbackParent : member.role === 'caregiver' ? fallbackCaregiver : 'Adult Member'),
    email: member.email || '',
    role: member.role || 'parent',
    status: member.status === 'invited' ? 'invited' : 'active',
  }));
};

const ensureDexcomOps = (household) => {
  const ops = household.dexcomOps || {};
  return {
    auditTrail: Array.isArray(ops.auditTrail) ? ops.auditTrail.slice(0, 24) : [],
    lastSuccessAt: ops.lastSuccessAt || '',
    lastFailureAt: ops.lastFailureAt || '',
    consecutiveFailures: Number.isFinite(Number(ops.consecutiveFailures)) ? Number(ops.consecutiveFailures) : 0,
    workerState: ops.workerState || 'idle',
    nextWorkerRunAt: ops.nextWorkerRunAt || '',
    lastWorkerRunAt: ops.lastWorkerRunAt || '',
    pausedUntil: ops.pausedUntil || '',
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

const buildDexcomHealthSummary = (household, dexcom) => {
  const ops = ensureDexcomOps(household);
  const authBroken = dexcom.status === 'error' && dexcom.tokenStatus === 'missing';
  const repeatedFailures = ops.consecutiveFailures >= 3;
  const rateLimited = dexcom.requestHealth === 'rate_limited';
  const state = authBroken || repeatedFailures ? 'broken' : rateLimited || dexcom.requestHealth === 'failed' || dexcom.dataFreshness === 'offline' ? 'watch' : 'healthy';
  const reason =
    authBroken
      ? 'broken_auth'
      : repeatedFailures
        ? 'repeated_failures'
        : rateLimited
          ? 'rate_limited'
          : dexcom.dataFreshness === 'offline' || dexcom.dataFreshness === 'stale'
            ? 'degraded_data'
            : dexcom.requestHealth === 'failed'
              ? 'request_failed'
              : 'ok';
  return {
    state,
    reason,
    headline:
      authBroken
        ? 'Dexcom needs a fresh authorization.'
        : repeatedFailures
          ? 'Dexcom has repeated failures and needs attention.'
          : rateLimited
            ? 'Dexcom is rate limited and backing off.'
            : dexcom.requestHealth === 'failed'
              ? 'Dexcom requests are failing and being watched.'
              : 'Dexcom sync is healthy.',
    detail:
      authBroken
        ? 'The integration no longer has a usable token. Run OAuth again to restore live sync.'
        : repeatedFailures
          ? 'Several sync attempts failed in a row. Keep the household in a safer fallback mode until the connection stabilizes.'
          : rateLimited
            ? 'The integration is respecting Dexcom rate limits and has delayed the next poll.'
            : dexcom.requestHealth === 'failed'
              ? (dexcom.lastError || 'Recent Dexcom requests failed and the system has slowed polling temporarily.')
              : 'Live data, token state, and polling cadence are operating normally.',
    nextStep:
      authBroken
        ? 'Run Dexcom OAuth again to restore live access.'
        : repeatedFailures
          ? 'Review connection health and wait for the scheduler to retry on the next safe window.'
          : rateLimited
            ? 'Let the scheduler wait until the cooldown ends before trying again.'
            : dexcom.dataFreshness === 'offline' || dexcom.dataFreshness === 'stale'
              ? 'Keep watching the device and wait for fresher CGM data before reacting hard.'
              : dexcom.requestHealth === 'failed'
                ? 'Let the background worker retry. If failures continue, reconnect Dexcom.'
                : 'No action is needed. The integration can continue in normal mode.',
    lastSuccessAt: ops.lastSuccessAt,
    lastFailureAt: ops.lastFailureAt,
    consecutiveFailures: ops.consecutiveFailures,
  };
};

const buildDexcomSchedulerSummary = (household) => {
  const ops = ensureDexcomOps(household);
  return {
    state: ops.workerState,
    headline:
      ops.workerState === 'paused'
        ? 'Background sync is paused while the integration cools down.'
        : ops.workerState === 'running'
          ? 'Background sync is actively processing the next Dexcom cycle.'
          : ops.workerState === 'scheduled'
            ? 'Background sync is scheduled and waiting for the next safe run window.'
            : 'Background sync is idle until a Dexcom cycle is due.',
    nextRunAt: ops.nextWorkerRunAt,
    lastRunAt: ops.lastWorkerRunAt,
    pausedUntil: ops.pausedUntil,
  };
};

const buildDailyGuidance = (user, household, currentState, dexcomHealth) => {
  const childName = household.childName || 'your child';
  const roleTitle =
    user.role === 'parent'
      ? 'Parent Daily Guidance'
      : user.role === 'caregiver'
        ? 'Caregiver Daily Guidance'
        : 'Daily Guidance';

  const fallback =
    dexcomHealth.reason === 'broken_auth'
      ? 'Restore Dexcom authorization before relying on live sync again.'
      : dexcomHealth.reason === 'rate_limited'
        ? 'Wait through the cooldown window and avoid forcing extra refreshes.'
        : dexcomHealth.reason === 'degraded_data'
          ? 'Treat sensor data as lower confidence until fresher readings arrive.'
          : dexcomHealth.reason === 'repeated_failures' || dexcomHealth.reason === 'request_failed'
            ? 'Stay in a safer fallback mode while the system retries in the background.'
            : 'Keep the routine simple and let the system continue in normal mode.';

  if (user.role === 'caregiver') {
    return {
      title: roleTitle,
      now: `Stay ready to support ${childName} if the primary responder needs backup.`,
      watch: 'Watch who is responding, whether recovery is moving, and whether data confidence is dropping.',
      fallback,
      checklist: [
        'Confirm the current responder before stepping in.',
        'Keep your phone available during the current watch window.',
        'Use fallback support if data quality drops or the parent misses the response.',
      ],
    };
  }

  if (user.role === 'adult') {
    return {
      title: roleTitle,
      now: 'Keep the current state simple: know the reading, the trend, and the next safe action.',
      watch: 'Watch for falling confidence, delayed data, and whether recovery is actually stabilizing.',
      fallback,
      checklist: [
        'Keep treatment close during watch or recovery states.',
        'Use DONE only after you have actually responded.',
        'Slow down decisions when data is stale or offline.',
      ],
    };
  }

  return {
    title: roleTitle,
    now: `Keep ${childName}'s current state, responder, and recovery path clear at a glance.`,
    watch: 'Watch for delayed data, repeated alerts, or a shift from stable monitoring into backup support.',
    fallback,
    checklist: [
      'Keep treatment and backup contact details easy to reach.',
      'Confirm who is responding before escalating further.',
      'If data confidence drops, check the sensor connection before reacting hard.',
    ],
  };
};

const buildHouseholdReadiness = (household, currentState, dexcomHealth, notificationSummary) => {
  const caregiverReady = Boolean(safeText(household.caregiverName, 120));
  const responderStable = Boolean(currentState.responder && currentState.responder !== 'Unassigned');
  const recoveryCovered = currentState.level === 'recovery' || currentState.level === 'ok';
  const connectionReady = dexcomHealth.state === 'healthy';
  const state =
    connectionReady && responderStable && (caregiverReady || notificationSummary.activeRecipient !== 'caregiver')
      ? 'ready'
      : dexcomHealth.state === 'broken' || !responderStable
        ? 'needs_attention'
        : 'watch';

  return {
    state,
    headline:
      state === 'ready'
        ? 'The household is ready for the current safety cycle.'
        : state === 'watch'
          ? 'The household is covered, but one part of readiness still needs watching.'
          : 'The household needs attention before this safety cycle is fully covered.',
    connection:
      dexcomHealth.reason === 'ok'
        ? 'Connection looks stable and live data is usable.'
        : dexcomHealth.nextStep,
    backup:
      caregiverReady
        ? `Backup support is available through ${household.caregiverName}.`
        : 'No backup caregiver is configured yet.',
    responder:
      responderStable
        ? `${currentState.responder} is the current responder.`
        : 'No clear responder is set right now.',
    recovery:
      recoveryCovered
        ? 'Recovery is either stable already or covered if the cycle changes.'
        : 'Recovery needs active watching until the state settles.',
  };
};

const buildContextualSummary = (user, household, currentState, dexcomHealth, householdReadiness) => {
  const childName = household.childName || 'your child';

  if (dexcomHealth.reason === 'broken_auth') {
    return {
      tone: 'attention',
      headline: 'Live sync needs to be restored.',
      detail: 'Dexcom authorization is no longer active, so the household should treat sensor support as unavailable until OAuth is restored.',
    };
  }

  if (dexcomHealth.reason === 'rate_limited') {
    return {
      tone: 'watch',
      headline: 'The system is cooling down after too many Dexcom requests.',
      detail: 'The next sync is already scheduled. There is no need to force extra refreshes right now.',
    };
  }

  if (currentState.level === 'recovery') {
    return {
      tone: 'watch',
      headline: 'Recovery is active and should stay calm.',
      detail: user.role === 'caregiver'
        ? `Stay available while ${childName} remains in recovery watch and avoid adding noise unless support is needed.`
        : `Keep the current recovery watch simple and steady until the state clearly settles again.`,
    };
  }

  if (currentState.dataStatus === 'offline' || currentState.dataStatus === 'delayed') {
    return {
      tone: 'watch',
      headline: 'Data confidence is reduced right now.',
      detail: 'Use the current state as guidance, but slow down decisions and confirm the sensor connection before reacting hard.',
    };
  }

  if (householdReadiness.state === 'needs_attention' || currentState.level === 'critical') {
    return {
      tone: 'attention',
      headline: 'The household needs a clear next step right now.',
      detail: user.role === 'caregiver'
        ? 'Confirm who is leading the response and be ready to step in without adding confusion.'
        : 'Keep the responder, the treatment step, and the backup path explicit until the cycle is covered.',
    };
  }

  if (currentState.level === 'watch' || currentState.level === 'risk') {
    return {
      tone: 'watch',
      headline: 'The day is stable, but this cycle still needs watching.',
      detail: 'Nothing needs a dramatic response yet. Stay close to the current trend, data quality, and responder status.',
    };
  }

  return {
    tone: 'calm',
    headline: 'The household is in a steady daily support state.',
    detail: user.role === 'adult'
      ? 'Keep the routine simple, let the system monitor in the background, and only step up if the state changes.'
      : `The household is covered right now, and ${childName}'s support loop can stay calm and predictable.`,
  };
};


const buildWorkspacePayload = (user, household = null) => {
  if (!household) {
    return {
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization || '',
      },
      needsSetup: true,
      household: null,
      currentState: null,
      deviceStatus: null,
      dexcomConnection: null,
      dexcomHealth: null,
      dexcomScheduler: null,
      dexcomAuditTrail: [],
      dailyGuidance: null,
      householdReadiness: null,
      contextualSummary: null,
      notificationSummary: null,
      notificationFeed: [],
      timeline: [],
      recentEvents: [],
      morningSummary: null,
      reviewSummary: null,
      dailyHistory: [],
      selectedSession: null,
      quickActions: [],
      nutrition: null,
    };
  }

  const childName = household.childName || (user.role === 'child' ? user.fullName : 'Mila');
  const primaryParent = household.primaryParent || (user.role === 'parent' ? user.fullName : 'Anna Rivera');
  const caregiverName = household.caregiverName || (user.role === 'caregiver' ? user.fullName : 'Jordan Lee');
  const householdName = household.householdName || `${childName} Safety Circle`;
  const safetyState = ensureSafetyState(household);
  const dexcom = ensureDexcomConnection(household);
  const currentStateBase = currentStateForRole(user.role, household, safetyState, user);
  const currentState = dexcom.status === 'connected' || dexcom.status === 'error'
    ? {
        ...currentStateBase,
        glucose: dexcom.latestGlucose ?? currentStateBase.glucose,
        trend: dexcom.latestTrend || currentStateBase.trend,
        dataStatus:
          dexcom.dataFreshness === 'live'
            ? 'live'
            : dexcom.dataFreshness === 'delayed'
              ? 'delayed'
              : dexcom.dataFreshness === 'stale'
                ? 'delayed'
                : 'offline',
        confidence:
          dexcom.dataFreshness === 'live'
            ? 'high'
            : dexcom.dataFreshness === 'delayed'
              ? 'medium'
              : 'low',
        recommendation:
          dexcom.dataFreshness === 'offline'
            ? 'Dexcom data is offline. Confirm the sensor connection before relying on the current reading.'
            : dexcom.dataFreshness === 'stale'
              ? 'Dexcom data is stale. Keep watch, but wait for a fresher reading before escalating hard.'
              : currentStateBase.recommendation,
      }
    : currentStateBase;
  const deviceStatusBase = deviceStatusForStage(currentState.mode, safetyState.stage, household);
  const deviceStatus = dexcom.status === 'connected' || dexcom.status === 'error'
    ? {
        ...deviceStatusBase,
        name: 'Dexcom CGM',
        status:
          dexcom.dataFreshness === 'live'
            ? 'connected'
            : dexcom.dataFreshness === 'offline'
              ? 'offline'
              : 'delayed',
        lastSync: dexcom.lastSync || deviceStatusBase.lastSync,
        signalAgeMinutes: dexcom.latestTimestamp ? Math.max(0, Math.round((Date.now() - Date.parse(dexcom.latestTimestamp)) / 60000)) : deviceStatusBase.signalAgeMinutes,
        lastGoodReading: dexcom.latestTimestamp
          ? `${Math.max(0, Math.round((Date.now() - Date.parse(dexcom.latestTimestamp)) / 60000))} minutes ago`
          : deviceStatusBase.lastGoodReading,
        confidenceNote:
          dexcom.dataFreshness === 'live'
            ? 'Confidence is based on live Dexcom readings.'
            : dexcom.dataFreshness === 'delayed'
              ? 'Confidence is reduced because Dexcom data is delayed.'
              : dexcom.dataFreshness === 'stale'
                ? 'Confidence is reduced because Dexcom data is stale.'
                : 'Confidence is low because Dexcom data is offline.',
        message: dexcom.message || deviceStatusBase.message,
      }
    : deviceStatusBase;
  const dexcomConnection = dexcomPayloadForHousehold(household);
  const dexcomHealth = buildDexcomHealthSummary(household, dexcomConnection);
  const dexcomScheduler = buildDexcomSchedulerSummary(household);
  const dexcomAuditTrail = ensureDexcomOps(household).auditTrail;
  const dailyGuidance = buildDailyGuidance(user, household, currentState, dexcomHealth);
  const safetyPreferences = {
    ...defaultSafetyPreferences(normalizeDiabetesType(household.diabetesType)),
    ...(household.safetyPreferences || {}),
  };
  const sessions = Array.isArray(safetyState.sessions) ? safetyState.sessions : [];
  const timeline = timelineForStage(safetyState.stage, household);
  const notificationSummary = notificationSummaryForStage(household);
  const householdReadiness = buildHouseholdReadiness(household, currentState, dexcomHealth, notificationSummary);
  const contextualSummary = buildContextualSummary(user, household, currentState, dexcomHealth, householdReadiness);
  const notificationFeed = notificationFeedForStage(household);
  const reviewSummary = {
    headline:
      notificationSummary.deliveryStatus === 'escalated'
        ? 'Delivery needed backup to keep this cycle covered.'
        : notificationSummary.deliveryStatus === 'retrying'
          ? 'Delivery is still in progress and being watched closely.'
          : safetyState.stage === 'recovery_watch'
            ? 'This cycle is now in review and recovery.'
            : 'This cycle is moving with a stable response path.',
    stabilityScore: Math.max(52, 92 - (safetyState.escalationCount || 0) * 12 - Math.max(0, (safetyState.alertsCount || 2) - Math.max(1, (safetyState.responders || []).length - 1)) * 5),
    deliveryReliability:
      notificationSummary.deliveryStatus === 'escalated'
        ? 'fragile'
        : notificationSummary.deliveryStatus === 'retrying'
          ? 'watch'
          : 'strong',
    responseConsistency:
      (safetyState.escalationCount || 0) > 1
        ? 'fragile'
        : (safetyState.escalationCount || 0) === 1
          ? 'watch'
          : 'strong',
    pattern:
      (safetyState.escalationCount || 0) > 1
        ? 'escalation-heavy'
        : (safetyState.alertsCount || 2) > 2
          ? 'repeat-risk'
          : 'steady',
    notes: [
      notificationSummary.deliveryStatus === 'escalated'
        ? 'Delivery had to escalate to keep the household covered.'
        : notificationSummary.deliveryStatus === 'retrying'
          ? 'Delivery needed at least one repeat before the loop settled.'
          : 'Delivery reached the intended responder cleanly.',
      (safetyState.escalationCount || 0) > 0
        ? 'Backup support was part of this response cycle.'
        : 'The primary response path stayed stable through the cycle.',
    ],
    nextFocus:
      (safetyState.escalationCount || 0) > 1
        ? 'Review routing and backup readiness before the next critical cycle.'
        : (safetyState.alertsCount || 2) > 2
          ? 'Review sensitivity and timing before this pattern repeats.'
          : 'Keep the same setup and watch only for repeated patterns.',
  };

  return {
    user: {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organization: user.organization || '',
    },
    needsSetup: false,
    household: {
      householdName,
      childName,
      childAgeBand: household.childAgeBand || '8-12',
      primaryParent,
      caregiverName,
      nightWindow: household.nightWindow || '10:00 PM - 7:00 AM',
      diabetesType: normalizeDiabetesType(household.diabetesType),
      inviteCode: household.inviteCode || '',
      members: buildHouseholdMembers(household, primaryParent, caregiverName),
      safetyPreferences,
    },
    currentState,
    deviceStatus,
    dexcomConnection,
    dexcomHealth,
    dexcomScheduler,
    dexcomAuditTrail,
    dailyGuidance,
    householdReadiness,
    contextualSummary,
    notificationSummary,
    notificationFeed,
    timeline,
    recentEvents: timeline.slice(-3).reverse(),
    morningSummary: {
      headline: `${childName} had ${safetyState.alertsCount || 2} alerts and ${(safetyState.escalationCount || 0)} escalation checks today.`,
      alertsCount: safetyState.alertsCount || 2,
      escalationCount: safetyState.escalationCount || 0,
      actionsCount: Math.max(1, (safetyState.responders || []).length - 1),
      responders: safetyState.responders || [primaryParent],
      outcome: safetyState.outcome || 'Recovery was monitored and the household stayed covered through the day.',
    },
    reviewSummary,
    dailyHistory: sessions.map((session) => ({
      id: session.id,
      headline: session.headline,
      dateLabel: session.dateLabel,
      outcome: session.outcome,
      alertsCount: session.alertsCount || 0,
      actionsCount: session.actionsCount || Math.max(1, (session.responders || []).length - 1),
      escalationCount: session.escalationCount || 0,
      responders: session.responders || [],
      timeline: session.timeline || [],
      review: session.review || reviewSummary,
    })),
    selectedSession: sessions[0]
      ? {
          ...sessions[0],
          actionsCount: sessions[0].actionsCount || Math.max(1, (sessions[0].responders || []).length - 1),
          review: sessions[0].review || reviewSummary,
        }
      : null,
    quickActions: actionSetByRole(user.role, household),
    nutrition: buildNutritionPayload(household, currentState),
  };
};

const buildWorkspacePayloadForRequest = (req, user, household = null) =>
  localizeWorkspacePayload(requestLang(req), buildWorkspacePayload(user, household));

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

  if (req.method === 'GET' && url.pathname === '/api/health') {
    const storageProbe = await probeStorage();
    const payload = {
      ok: storageProbe.ok !== false,
      service: 't1d-api',
      timestamp: new Date().toISOString(),
      storage: storageProbe.backend || getStorageBackend(),
      rateLimit: isUpstashRateLimitEnabled() ? 'upstash' : 'memory',
      dexcomLive: dexcomEnvConfig().useLiveMode,
      alertRuleVersion: ALERT_RULE_VERSION,
    };
    if (storageProbe.error) payload.storageError = storageProbe.error;
    if (url.searchParams.get('verbose') === '1') {
      payload.version = process.env.npm_package_version || '1.1.0';
      payload.node = process.version;
      payload.requestId = req.requestId;
    }
    sendJson(res, 200, payload);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/openapi.yaml') {
    try {
      const spec = await fs.readFile(path.join(__dirname, '..', 'docs', 'openapi.yaml'), 'utf8');
      applySecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'application/yaml; charset=utf-8' });
      res.end(spec);
    } catch {
      sendJson(res, 404, { error: 'OpenAPI spec not found' });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/cron/dexcom-sync') {
    const authHeader = String(req.headers.authorization || '');
    const cronSecret = CRON_SECRET;
    if (!cronSecret) {
      sendJson(res, 503, { error: 'Service unavailable' });
      return;
    }
    if (!safeEqualString(authHeader, `Bearer ${cronSecret}`)) {
      sendJson(res, 401, { error: 'Unauthorized cron request' });
      return;
    }
    const result = await runBackgroundDexcomSync();
    sendJson(res, 200, { ok: true, ...result });
    return;
  }


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
