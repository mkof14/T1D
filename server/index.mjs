import http from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  actionForDone,
  actionSetByRole,
  applySafetyAction,
  createDefaultSafetyState,
  currentStateForRole,
  deviceStatusForStage,
  ensureSafetyState,
  notificationFeedForStage,
  notificationSummaryForStage,
  operatingMode,
  timelineForStage,
} from './state-machine.mjs';
import {
  connectDexcom,
  dexcomOAuthCallback,
  dexcomOAuthStart,
  dexcomPayloadForHousehold,
  dexcomEnvConfig,
  disconnectDexcom,
  ensureDexcomConnection,
  pollDexcom,
  pollDexcomLive,
  refreshDexcomToken,
} from './dexcom-service.mjs';
import { startDexcomSyncWorker } from './sync-worker.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;

const PORT = Number(process.env.T1D_API_PORT || 8790);
const BACKGROUND_SYNC_INTERVAL_MS = Number(process.env.T1D_BACKGROUND_SYNC_INTERVAL_MS || 15000);
const DATA_DIR = process.env.T1D_DATA_DIR || (process.env.VERCEL ? '/tmp/t1d-data' : path.join(__dirname, 'data'));
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const HOUSEHOLDS_FILE = path.join(DATA_DIR, 'households.json');
const SESSION_COOKIE = 't1d_sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
];
const ENV_ALLOWED_ORIGINS = String(process.env.T1D_ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = new Set([...DEFAULT_ALLOWED_ORIGINS, ...ENV_ALLOWED_ORIGINS]);

const ensureDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readJson = async (file, fallback) => {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = async (file, value) => {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(value, null, 2));
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const safeText = (value, max = 160) => String(value || '').trim().slice(0, max);
const safeRole = (value) => (['parent', 'adult', 'caregiver'].includes(value) ? value : 'parent');

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
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

const sendEmpty = (res, status, headers = {}) => {
  res.writeHead(status, headers);
  res.end();
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
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
const defaultSafetyPreferences = () => ({
  daySensitivity: 'balanced',
  nightSensitivity: 'protective',
  caregiverDelaySeconds: 60,
  dayPrimaryContact: 'parent',
  nightPrimaryContact: 'parent',
});

const normalizeHouseholdRecord = (household) => {
  if (!household || typeof household !== 'object') return household;
  const safetyState = ensureSafetyState(household);
  const { nightState: _legacyNightState, ...rest } = household;
  return {
    ...rest,
    safetyState,
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
  const nextDexcom = dexcomEnvConfig().useLiveMode
    ? await pollDexcomLive(household)
    : pollDexcom(household);

  return appendDexcomAudit({
    ...household,
    dexcom: nextDexcom,
    updatedAt: new Date().toISOString(),
  }, {
    kind: nextDexcom.status === 'error' ? 'error' : 'poll',
    status: nextDexcom.status === 'error' ? 'error' : nextDexcom.requestHealth === 'retrying' || nextDexcom.dataFreshness !== 'live' ? 'warning' : 'ok',
    headline: nextDexcom.status === 'error'
      ? `Dexcom ${source} poll failed`
      : `Dexcom ${source} poll completed`,
    detail: nextDexcom.message,
  });
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
  const safetyPreferences = household.safetyPreferences || defaultSafetyPreferences();
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
    quickActions: actionSetByRole(user.role),
  };
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

export const handleRequest = async (req, res) => {
  withCors(req, res);

  if (req.method === 'OPTIONS') {
    sendEmpty(res, 204);
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/session') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 200, { authenticated: false });
      return;
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
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/workspace') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }
    const households = await readHouseholds();
    const household = households.find((entry) => entry.id === current.user.householdId) || null;
    sendJson(res, 200, buildWorkspacePayload(current.user, household));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/household/setup') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const householdName = safeText(body.householdName, 120);
    const childName = safeText(body.childName, 120);
    const childAgeBand = safeText(body.childAgeBand, 40);
    const primaryParent = safeText(body.primaryParent, 120);
    const caregiverName = safeText(body.caregiverName, 120);
    const nightWindow = safeText(body.nightWindow, 60);

    if (!householdName || !childName || !primaryParent || !nightWindow) {
      sendJson(res, 400, { error: 'Household name, child, parent, and night window are required' });
      return;
    }

    const households = await readHouseholds();
    const existing = households.find((entry) => entry.id === current.user.householdId);
    const initialSafetyState = createDefaultSafetyState({ primaryParent, caregiverName });
    const existingSafetyState = existing?.safetyState || initialSafetyState;
    const nextHousehold = existing
      ? {
          ...existing,
          householdName,
          childName,
          childAgeBand,
          primaryParent,
          caregiverName,
          nightWindow,
          inviteCode: existing.inviteCode || randomBytes(3).toString('hex').toUpperCase(),
          members: (() => {
            const existingMembers = Array.isArray(existing.members) ? existing.members : [];
            const nextMembers = existingMembers.filter((member) => member.userId !== current.user.id);
            nextMembers.unshift({
              id: current.user.id,
              userId: current.user.id,
              fullName: current.user.fullName,
              email: current.user.email,
              role: current.user.role,
              status: 'active',
            });
            if (caregiverName) {
              const hasCaregiverInvite = nextMembers.some((member) => member.role === 'caregiver' && member.status === 'invited');
              if (!hasCaregiverInvite) {
                nextMembers.push({
                  id: `invite-${randomBytes(4).toString('hex')}`,
                  fullName: caregiverName,
                  email: '',
                  role: 'caregiver',
                  status: 'invited',
                });
              }
            }
            return nextMembers;
          })(),
          safetyPreferences: existing.safetyPreferences || defaultSafetyPreferences(),
          safetyState: existingSafetyState,
          updatedAt: new Date().toISOString(),
        }
      : {
          id: randomBytes(10).toString('hex'),
          householdName,
          childName,
          childAgeBand,
          primaryParent,
          caregiverName,
          nightWindow,
          inviteCode: randomBytes(3).toString('hex').toUpperCase(),
          members: [
            {
              id: current.user.id,
              userId: current.user.id,
              fullName: current.user.fullName,
              email: current.user.email,
              role: current.user.role,
              status: 'active',
            },
            ...(caregiverName
              ? [{
                  id: `invite-${randomBytes(4).toString('hex')}`,
                  fullName: caregiverName,
                  email: '',
                  role: 'caregiver',
                  status: 'invited',
                }]
              : []),
          ],
          safetyPreferences: defaultSafetyPreferences(),
          safetyState: initialSafetyState,
          createdBy: current.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const nextHouseholds = existing
      ? households.map((entry) => (entry.id === existing.id ? nextHousehold : entry))
      : [...households, nextHousehold];

    await writeHouseholds(nextHouseholds);
    await updateUser(current.user.id, { householdId: nextHousehold.id });

    sendJson(res, 200, {
      household: buildWorkspacePayload(current.user, nextHousehold).household,
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/household/join') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const inviteCode = safeText(body.inviteCode, 24).toUpperCase();
    if (!inviteCode) {
      sendJson(res, 400, { error: 'Invite code is required' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.inviteCode === inviteCode);
    if (householdIndex === -1) {
      sendJson(res, 404, { error: 'Invite code was not found' });
      return;
    }

    const household = households[householdIndex];
    const existingMembers = Array.isArray(household.members) ? household.members : [];
    const nextMembers = existingMembers.filter((member) => member.userId !== current.user.id);
    const invitedMatchIndex = nextMembers.findIndex((member) => member.status === 'invited' && member.role === current.user.role);

    if (invitedMatchIndex >= 0) {
      nextMembers[invitedMatchIndex] = {
        ...nextMembers[invitedMatchIndex],
        id: current.user.id,
        userId: current.user.id,
        fullName: current.user.fullName,
        email: current.user.email,
        status: 'active',
      };
    } else {
      nextMembers.push({
        id: current.user.id,
        userId: current.user.id,
        fullName: current.user.fullName,
        email: current.user.email,
        role: current.user.role,
        status: 'active',
      });
    }

    const nextHousehold = {
      ...household,
      members: nextMembers,
      updatedAt: new Date().toISOString(),
    };
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    await updateUser(current.user.id, { householdId: nextHousehold.id });

    sendJson(res, 200, {
      household: buildWorkspacePayload(current.user, nextHousehold).household,
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/preferences') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const daySensitivity = ['gentle', 'balanced', 'watchful'].includes(body.daySensitivity) ? body.daySensitivity : 'balanced';
    const nightSensitivity = ['balanced', 'protective', 'urgent'].includes(body.nightSensitivity) ? body.nightSensitivity : 'protective';
    const caregiverDelaySeconds = [20, 40, 60].includes(Number(body.caregiverDelaySeconds)) ? Number(body.caregiverDelaySeconds) : 60;
    const normalizePrimaryContact = (value, household) => {
      if (!['parent', 'adult', 'caregiver'].includes(value)) return 'parent';
      if (value === 'caregiver' && !safeText(household?.caregiverName, 120)) return 'parent';
      return value;
    };
    const households = await readHouseholds();
    const currentHousehold = households.find((entry) => entry.id === current.user.householdId);
    const dayPrimaryContact = normalizePrimaryContact(body.dayPrimaryContact, currentHousehold);
    const nightPrimaryContact = normalizePrimaryContact(body.nightPrimaryContact, currentHousehold);
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const nextHousehold = {
      ...households[householdIndex],
      safetyPreferences: {
        daySensitivity,
        nightSensitivity,
        caregiverDelaySeconds,
        dayPrimaryContact,
        nightPrimaryContact,
      },
      updatedAt: new Date().toISOString(),
    };
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }


  if (req.method === 'POST' && url.pathname === '/api/dexcom/oauth/start') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const start = dexcomOAuthStart(households[householdIndex], current.user.fullName || current.user.email);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: start.dexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'oauth_start',
      status: start.dexcom.configStatus === 'ready' ? 'ok' : 'warning',
      headline: 'Dexcom OAuth start',
      detail: start.dexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, { workspace: buildWorkspacePayload(current.user, nextHousehold), redirectUrl: start.redirectUrl });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/oauth/callback') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const body = await readBody(req);
    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const nextDexcom = await dexcomOAuthCallback(households[householdIndex], safeText(body?.code, 240));
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'oauth_callback',
      status: nextDexcom.status === 'connected' ? 'ok' : 'error',
      headline: 'Dexcom OAuth callback',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/refresh-token') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const nextDexcom = await refreshDexcomToken(households[householdIndex]);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'token_refresh',
      status: nextDexcom.status === 'connected' ? 'ok' : 'error',
      headline: 'Dexcom token refresh',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/connect') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const body = await readBody(req);
    const nextDexcom = connectDexcom(households[householdIndex], safeText(body?.accountName, 120) || current.user.fullName || current.user.email);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'connect',
      status: 'ok',
      headline: 'Dexcom connected',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/disconnect') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const nextDexcom = disconnectDexcom(households[householdIndex]);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'disconnect',
      status: 'warning',
      headline: 'Dexcom disconnected',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/poll') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const nextHousehold = await applyDexcomPollToHousehold(households[householdIndex], 'manual');
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }

  if (req.method === 'POST' && (url.pathname === '/api/action' || url.pathname === '/api/night-action')) {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object' || !body.action) {
      sendJson(res, 400, { error: 'Action is required' });
      return;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return;
    }

    const household = households[householdIndex];
    const normalizedAction = safeText(body.action, 80) === 'DONE' ? actionForDone(current.user.role, operatingMode(), household) : safeText(body.action, 80);
    const nextSafetyState = applySafetyAction(current.user, household, normalizedAction);
    const nextHousehold = {
      ...household,
      safetyState: nextSafetyState,
      updatedAt: new Date().toISOString(),
    };
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayload(current.user, nextHousehold));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/access/signout') {
    const cookies = parseCookies(req.headers.cookie);
    const sid = cookies[SESSION_COOKIE];
    if (sid) {
      const sessions = await readSessions();
      await writeSessions(sessions.filter((entry) => entry.id !== sid));
    }
    sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    return;
  }

  if (req.method === 'POST' && (url.pathname === '/api/access/signin' || url.pathname === '/api/access/signup')) {
    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const email = normalizeEmail(body.email);
    const password = safeText(body.password, 200);
    if (!email || !password) {
      sendJson(res, 400, { error: 'Email and password are required' });
      return;
    }

    const users = await readUsers();

    if (url.pathname === '/api/access/signup') {
      if (users.some((entry) => entry.email === email)) {
        sendJson(res, 409, { error: 'This email already has a T1D account' });
        return;
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

      const sessions = await readSessions();
      const nextSession = {
        id: randomBytes(18).toString('hex'),
        userId: nextUser.id,
        expiresAt: Date.now() + SESSION_TTL_MS,
      };
      sessions.push(nextSession);
      await writeSessions(sessions);

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
      return;
    }

    const existing = users.find((entry) => entry.email === email);
    if (!existing || !verifyPassword(password, existing.passwordHash)) {
      sendJson(res, 401, { error: 'Email or password is incorrect' });
      return;
    }

    const sessions = await readSessions();
    const nextSession = {
      id: randomBytes(18).toString('hex'),
      userId: existing.id,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessions.push(nextSession);
    await writeSessions(sessions);
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
