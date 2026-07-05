import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  createDefaultSafetyState,
  ensureSafetyState,
} from '../state-machine.mjs';
import {
  dexcomEnvConfig,
  ensureDexcomConnection,
  pollDexcom,
  pollDexcomLive,
  sealDexcomTokens,
} from '../dexcom-service.mjs';
import { ensureDexcomOps } from '../dexcom-ops.mjs';
import { createStorage } from '../storage.mjs';
import { applyAlertEvaluation } from '../alert-engine.mjs';
import { createRateLimiter, clientIp } from '../rate-limit.mjs';
import { requestLang, t } from '../backend-i18n.mjs';
import { applySecurityHeaders } from '../security-headers.mjs';
import { attachRequestContext } from '../request-context.mjs';
import { defaultSafetyPreferences, normalizeDiabetesType } from '../diabetes-type.mjs';
import { handleAlertTimelineRoutes } from './routes/alert-timeline.routes.mjs';
import { handleAuthRoutes } from './routes/auth.routes.mjs';
import { handleHouseholdRoutes } from './routes/household.routes.mjs';
import { handleDexcomRoutes } from './routes/dexcom.routes.mjs';
import { handleWorkspaceRoutes } from './routes/workspace.routes.mjs';
import { handleFeedbackRoutes } from './routes/feedback.routes.mjs';
import { handleSystemRoutes } from './routes/system.routes.mjs';
import { buildWorkspacePayloadForRequest } from '../services/workspace-payload-service.mjs';
import { createAuthStorage } from '../services/auth-storage.mjs';
import { createHouseholdStorage } from '../services/household-storage.mjs';
import { createDexcomPollService } from '../services/dexcom-poll-service.mjs';
import { dualWritePollReadings, dualWriteDexcomConnection, dualWriteAlertCreated } from '../infrastructure/repositories/dual-write-service.mjs';
import { hashPassword, isValidPassword, verifyPassword } from '../lib/password.mjs';
import {
  createCookieHelpers,
  normalizeEmail,
  parseCookies,
  safeEqualString,
  safeRole,
  safeText,
} from '../lib/request-utils.mjs';
import { createHttpResponse, BODY_TOO_LARGE } from '../lib/http-response.mjs';

export const createApp = ({ serverDir }) => {
  const DATA_DIR = process.env.T1D_DATA_DIR || (process.env.VERCEL ? '/tmp/t1d-data' : path.join(serverDir, 'data'));
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

  const generateInviteCode = () => randomBytes(16).toString('hex').toUpperCase();

  const { createSessionCookie, clearSessionCookie } = createCookieHelpers({
    sessionCookie: SESSION_COOKIE,
    sessionTtlMs: SESSION_TTL_MS,
  });

  const {
    sendJson,
    sendEmpty,
    readBody,
    withCors,
    assertMutationOrigin,
  } = createHttpResponse({
    applySecurityHeaders,
    maxBodyBytes: MAX_BODY_BYTES,
    allowedOrigins: ALLOWED_ORIGINS,
    isProductionRuntime,
  });

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
    mirrorUsersToSql,
  } = authStorage;

  const findSessionUser = async (req) => authStorage.findSessionUser(req, parseCookies);

  const householdStorage = createHouseholdStorage({
    readJson,
    writeJson,
    HOUSEHOLDS_FILE,
    ensureSafetyState,
    normalizeDiabetesType,
    sealDexcomTokens,
    ensureDexcomConnection,
    dualWriteDexcomConnection,
  });

  const {
    readHouseholds,
    writeHouseholds,
    persistHouseholdUpdate,
    persistHouseholdRecord,
    mirrorHouseholdToSql,
  } = householdStorage;

  const dexcomPollService = createDexcomPollService({
    randomBytes,
    ensureDexcomOps,
    ensureDexcomConnection,
    dexcomEnvConfig,
    pollDexcom,
    pollDexcomLive,
    applyAlertEvaluation,
    dualWritePollReadings,
    dualWriteDexcomConnection,
    dualWriteAlertCreated,
    t,
    readHouseholds,
    writeHouseholds,
  });

  const {
    appendDexcomAudit,
    shouldRunBackgroundDexcomPoll,
    applyDexcomPollToHousehold,
    runBackgroundDexcomSync,
  } = dexcomPollService;

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
    persistHouseholdUpdate,
    persistHouseholdRecord,
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
    removeSession,
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
    isValidPassword: (password) => isValidPassword(password, MIN_PASSWORD_LENGTH),
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

  const handleRequest = async (req, res) => {
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
    if (await handleAlertTimelineRoutes(routeCtx)) return;

    sendJson(res, 404, { error: 'Not found' });
  };

  return {
    handleRequest,
    readHouseholds,
    writeHouseholds,
    shouldRunBackgroundDexcomPoll,
    applyDexcomPollToHousehold,
    appendDexcomAudit,
    runBackgroundDexcomSync,
  };
};
