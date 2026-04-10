import { randomBytes } from 'node:crypto';

const trendSequence = ['flat', 'down', 'down', 'flat', 'up'];
const DEXCOM_SCOPES = 'offline_access';
const DEFAULT_EGV_PATH = '/v3/users/self/egvs';
const DEFAULT_DEVICE_PATH = '/v2/users/self/devices';

const nowIso = () => new Date().toISOString();

const freshnessFromMinutes = (minutes) => {
  if (minutes <= 8) return 'live';
  if (minutes <= 18) return 'delayed';
  if (minutes <= 45) return 'stale';
  return 'offline';
};

const nextTrend = (index) => trendSequence[index % trendSequence.length];

const nextGlucose = (current, trend) => {
  if (trend === 'down') return Math.max(58, current - 6);
  if (trend === 'up') return Math.min(145, current + 5);
  return Math.max(70, Math.min(125, current + (current % 2 === 0 ? -1 : 1)));
};

class DexcomApiError extends Error {
  constructor(message, { status = 0, code = '', retryAfterSeconds = 0, rateLimitResetAt = '', transient = false } = {}) {
    super(message);
    this.name = 'DexcomApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.rateLimitResetAt = rateLimitResetAt;
    this.transient = transient;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isoAfterSeconds = (seconds = 0) => (seconds > 0 ? new Date(Date.now() + seconds * 1000).toISOString() : '');
const safeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const requestHealthFromStatus = (status, retryCount = 0) => {
  if (status === 'connected' && retryCount > 0) return 'retrying';
  if (status === 'error') return 'failed';
  return 'healthy';
};

const buildTimeoutSignal = (timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
};

const dexcomRequest = async (url, { method = 'GET', headers = {}, body, timeoutMs = 10000, maxRetries = 2, retryDelayMs = 500 } = {}) => {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const { signal, cancel } = buildTimeoutSignal(timeoutMs);
    try {
      const response = await fetch(url, { method, headers, body, signal });
      const raw = await response.text();
      let parsed = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = raw;
      }
      if (!response.ok) {
        const detail = typeof parsed === 'string' ? parsed : parsed?.error || parsed?.message || response.statusText;
        const retryAfterSeconds = safeNumber(response.headers.get('retry-after'), 0);
        const rateLimitResetRaw = response.headers.get('x-ratelimit-reset') || response.headers.get('ratelimit-reset') || '';
        const rateLimitResetAt = /^\d+$/.test(rateLimitResetRaw)
          ? new Date(Number(rateLimitResetRaw) * 1000).toISOString()
          : rateLimitResetRaw;
        const transient = response.status === 429 || response.status >= 500;
        throw new DexcomApiError(`Dexcom request failed (${response.status}): ${detail}`, {
          status: response.status,
          code: typeof parsed === 'object' && parsed ? String(parsed.error || '') : '',
          retryAfterSeconds,
          rateLimitResetAt,
          transient,
        });
      }
      return {
        payload: parsed,
        meta: {
          attempts: attempt,
          retryAfterSeconds: 0,
          rateLimitResetAt: '',
        },
      };
    } catch (error) {
      const normalized =
        error instanceof DexcomApiError
          ? error
          : error instanceof Error && error.name === 'AbortError'
            ? new DexcomApiError('Dexcom request timed out before the API responded.', { transient: true })
            : new DexcomApiError(error instanceof Error ? error.message : 'Dexcom request failed unexpectedly.', { transient: true });

      const shouldRetry = normalized.transient && attempt < maxRetries;
      if (!shouldRetry) throw normalized;

      const backoffMs = normalized.retryAfterSeconds > 0
        ? normalized.retryAfterSeconds * 1000
        : retryDelayMs * (attempt + 1);
      await wait(backoffMs);
    } finally {
      cancel();
    }
  }
};

const nextPollAt = (seconds = 60) => new Date(Date.now() + seconds * 1000).toISOString();
const nextPollFromIso = (value, fallbackSeconds = 60) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) && parsed > Date.now()
    ? new Date(parsed).toISOString()
    : nextPollAt(fallbackSeconds);
};

const maskToken = (value) => {
  if (!value) return '';
  const token = String(value);
  if (token.length <= 8) return token;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
};

const tokenStatusForExpiry = (expiresAt) => {
  if (!expiresAt) return 'missing';
  const msLeft = Date.parse(expiresAt) - Date.now();
  if (msLeft <= 0) return 'expired';
  if (msLeft <= 1000 * 60 * 10) return 'expiring_soon';
  return 'active';
};

const buildMockTokenBundle = (seed = '') => {
  const suffix = randomBytes(4).toString('hex');
  const accessToken = `dexcom_access_${seed || suffix}_${randomBytes(6).toString('hex')}`;
  const refreshToken = `dexcom_refresh_${seed || suffix}_${randomBytes(6).toString('hex')}`;
  return {
    accessToken,
    refreshToken,
    accessTokenPreview: maskToken(accessToken),
    refreshTokenPreview: maskToken(refreshToken),
    tokenType: 'Bearer',
    scope: DEXCOM_SCOPES,
    tokenIssuedAt: nowIso(),
    tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastTokenRefreshAt: nowIso(),
  };
};

export const defaultDexcomConnection = () => ({
  provider: 'Dexcom',
  status: 'disconnected',
  authMode: 'mock',
  configStatus: 'missing',
  accountName: '',
  missingConfig: ['DEXCOM_CLIENT_ID', 'DEXCOM_CLIENT_SECRET', 'DEXCOM_REDIRECT_URI'],
  oauthRedirectPath: '/api/dexcom/oauth/callback',
  lastSync: '',
  lastPollAt: '',
  tokenExpiresAt: '',
  refreshTokenExpiresAt: '',
  tokenIssuedAt: '',
  lastTokenRefreshAt: '',
  tokenStatus: 'missing',
  tokenType: '',
  scope: DEXCOM_SCOPES,
  accessTokenPreview: '',
  refreshTokenPreview: '',
  hasRefreshToken: false,
  requestHealth: 'healthy',
  retryCount: 0,
  rateLimitResetAt: '',
  lastError: '',
  deviceLabel: '',
  deviceRuntime: 'unknown',
  autoRefreshState: 'idle',
  pollIntervalSeconds: 60,
  nextPollDueAt: '',
  authorizePath: '',
  dataFreshness: 'offline',
  latestGlucose: null,
  latestTrend: 'unknown',
  latestTimestamp: '',
  readings: [],
  pollCount: 0,
  message: 'Dexcom is not connected yet.',
});

export const ensureDexcomConnection = (household) => household.dexcom || defaultDexcomConnection();

export const dexcomEnvConfig = () => {
  const clientId = process.env.DEXCOM_CLIENT_ID || '';
  const clientSecret = process.env.DEXCOM_CLIENT_SECRET || '';
  const redirectUri = process.env.DEXCOM_REDIRECT_URI || '';
  const authorizeBase = process.env.DEXCOM_AUTHORIZE_URL || 'https://sandbox-api.dexcom.com/v2/oauth2/login';
  const tokenUrl = process.env.DEXCOM_TOKEN_URL || 'https://sandbox-api.dexcom.com/v2/oauth2/token';
  const apiBase = process.env.DEXCOM_API_BASE_URL || 'https://sandbox-api.dexcom.com';
  const egvPath = process.env.DEXCOM_EGV_PATH || DEFAULT_EGV_PATH;
  const devicePath = process.env.DEXCOM_DEVICE_PATH || DEFAULT_DEVICE_PATH;
  const timeoutMs = Number(process.env.DEXCOM_HTTP_TIMEOUT_MS || 10000);
  const maxRetries = Number(process.env.DEXCOM_HTTP_MAX_RETRIES || 2);
  const retryDelayMs = Number(process.env.DEXCOM_HTTP_RETRY_DELAY_MS || 500);
  const pollIntervalSeconds = Number(process.env.DEXCOM_POLL_INTERVAL_SECONDS || 60);
  const degradedPollIntervalSeconds = Number(process.env.DEXCOM_DEGRADED_POLL_INTERVAL_SECONDS || 180);
  const rateLimitedPollIntervalSeconds = Number(process.env.DEXCOM_RATE_LIMIT_POLL_INTERVAL_SECONDS || 300);
  const useLiveMode = process.env.DEXCOM_USE_LIVE === 'true';
  const ready = Boolean(clientId && clientSecret && redirectUri);
  const stateToken = randomBytes(8).toString('hex');

  const authorizeUrl = ready
    ? `${authorizeBase}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(DEXCOM_SCOPES)}&state=${stateToken}`
    : '';

  const missingConfig = [
    !clientId ? 'DEXCOM_CLIENT_ID' : '',
    !clientSecret ? 'DEXCOM_CLIENT_SECRET' : '',
    !redirectUri ? 'DEXCOM_REDIRECT_URI' : '',
  ].filter(Boolean);

  return {
    ready,
    clientId,
    clientSecret,
    redirectUri,
    authorizeBase,
    tokenUrl,
    apiBase,
    egvPath,
    devicePath,
    timeoutMs,
    maxRetries,
    retryDelayMs,
    pollIntervalSeconds,
    degradedPollIntervalSeconds,
    rateLimitedPollIntervalSeconds,
    useLiveMode,
    authorizeUrl,
    missingConfig,
  };
};

const applyPollRecoveryPlan = (connection, mode = 'healthy', details = {}) => {
  const env = dexcomEnvConfig();
  if (mode === 'rate_limited') {
    const dueAt = nextPollFromIso(details.rateLimitResetAt, env.rateLimitedPollIntervalSeconds);
    return {
      ...connection,
      pollIntervalSeconds: env.rateLimitedPollIntervalSeconds,
      nextPollDueAt: dueAt,
    };
  }
  if (mode === 'degraded') {
    return {
      ...connection,
      pollIntervalSeconds: env.degradedPollIntervalSeconds,
      nextPollDueAt: nextPollAt(env.degradedPollIntervalSeconds),
    };
  }
  return {
    ...connection,
    pollIntervalSeconds: env.pollIntervalSeconds,
    nextPollDueAt: nextPollAt(env.pollIntervalSeconds),
  };
};

const tokenBundleFromLivePayload = (payload, currentRefreshToken = '') => {
  const accessToken = String(payload?.access_token || '');
  const refreshToken = String(payload?.refresh_token || currentRefreshToken || '');
  const expiresIn = Number(payload?.expires_in || 3600);
  const refreshExpiresIn = Number(payload?.refresh_expires_in || 60 * 60 * 24 * 30);
  return {
    accessToken,
    refreshToken,
    accessTokenPreview: maskToken(accessToken),
    refreshTokenPreview: maskToken(refreshToken),
    tokenType: String(payload?.token_type || 'Bearer'),
    scope: String(payload?.scope || DEXCOM_SCOPES),
    tokenIssuedAt: nowIso(),
    tokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    refreshTokenExpiresAt: refreshToken ? new Date(Date.now() + refreshExpiresIn * 1000).toISOString() : '',
    lastTokenRefreshAt: nowIso(),
    hasRefreshToken: Boolean(refreshToken),
  };
};

const normalizeTrend = (value) => {
  const trend = String(value || '').toLowerCase();
  if (trend.includes('down')) return 'down';
  if (trend.includes('up')) return 'up';
  if (trend.includes('flat')) return 'flat';
  if (trend.includes('steady')) return 'flat';
  return 'unknown';
};

const extractEgvRecords = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.egvs)) return payload.egvs;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const mapLiveReadings = (records) =>
  records
    .map((item, index) => ({
      id: String(item?.systemTime || item?.displayTime || item?.id || `live-${index}`),
      timestamp: String(item?.systemTime || item?.displayTime || item?.timestamp || nowIso()),
      glucose: Number(item?.value ?? item?.glucoseValue ?? item?.realtimeValue ?? NaN),
      trend: normalizeTrend(item?.trend || item?.trendRate || item?.trendDirection),
    }))
    .filter((item) => Number.isFinite(item.glucose));

const extractDeviceRecords = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.devices)) return payload.devices;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const mapLiveDevice = (records) => {
  const latest = records[0] || {};
  const runtimeSource = String(
    latest?.status ||
    latest?.connectionStatus ||
    latest?.deviceStatus ||
    ''
  ).toLowerCase();

  return {
    deviceLabel: String(
      latest?.displayName ||
      latest?.displayDevice ||
      latest?.name ||
      latest?.model ||
      latest?.deviceName ||
      'Dexcom CGM'
    ),
    deviceRuntime: runtimeSource.includes('off')
      ? 'offline'
      : runtimeSource.includes('on')
        ? 'connected'
        : 'unknown',
  };
};

const liveTokenExchange = async (code) => {
  const env = dexcomEnvConfig();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.redirectUri,
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });
  const { payload } = await dexcomRequest(env.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    timeoutMs: env.timeoutMs,
    maxRetries: env.maxRetries,
    retryDelayMs: env.retryDelayMs,
  });
  return payload;
};

const liveRefreshExchange = async (refreshToken) => {
  const env = dexcomEnvConfig();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });
  const { payload } = await dexcomRequest(env.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    timeoutMs: env.timeoutMs,
    maxRetries: env.maxRetries,
    retryDelayMs: env.retryDelayMs,
  });
  return payload;
};

const livePollReadings = async (connection) => {
  const env = dexcomEnvConfig();
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000);
  const query = new URLSearchParams({
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  });
  const response = await dexcomRequest(`${env.apiBase}${env.egvPath}?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `${connection.tokenType || 'Bearer'} ${connection.accessToken}`,
      Accept: 'application/json',
    },
    timeoutMs: env.timeoutMs,
    maxRetries: env.maxRetries,
    retryDelayMs: env.retryDelayMs,
  });
  const readings = mapLiveReadings(extractEgvRecords(response.payload)).slice(-12);
  return { readings, meta: response.meta };
};

const livePollDevice = async (connection) => {
  const env = dexcomEnvConfig();
  const response = await dexcomRequest(`${env.apiBase}${env.devicePath}`, {
    method: 'GET',
    headers: {
      Authorization: `${connection.tokenType || 'Bearer'} ${connection.accessToken}`,
      Accept: 'application/json',
    },
    timeoutMs: env.timeoutMs,
    maxRetries: env.maxRetries,
    retryDelayMs: env.retryDelayMs,
  });
  return {
    device: mapLiveDevice(extractDeviceRecords(response.payload)),
    meta: response.meta,
  };
};

const shouldRefreshBeforePoll = (connection) =>
  connection.tokenStatus === 'expired' || connection.tokenStatus === 'expiring_soon';

const seedReadings = () => {
  const baseTime = Date.now() - 1000 * 60 * 10;
  return Array.from({ length: 4 }).map((_, index) => {
    const trend = nextTrend(index);
    return {
      id: randomBytes(6).toString('hex'),
      timestamp: new Date(baseTime + index * 1000 * 60 * 5).toISOString(),
      glucose: 110 - index * 4,
      trend,
    };
  });
};

export const connectDexcom = (household, accountName = '') => {
  const env = dexcomEnvConfig();
  const readings = seedReadings();
  const latest = readings[readings.length - 1];
  const tokens = buildMockTokenBundle();
  return {
    ...ensureDexcomConnection(household),
    provider: 'Dexcom',
    status: 'connected',
    authMode: env.ready ? 'oauth_ready' : 'mock',
    configStatus: env.ready ? 'ready' : 'missing',
    accountName: accountName || household.primaryParent || 'Dexcom Member',
    missingConfig: env.missingConfig,
    oauthRedirectPath: '/api/dexcom/oauth/callback',
    lastSync: nowIso(),
    lastPollAt: nowIso(),
    ...tokens,
    tokenStatus: tokenStatusForExpiry(tokens.tokenExpiresAt),
    requestHealth: 'healthy',
    retryCount: 0,
    rateLimitResetAt: '',
    lastError: '',
    deviceLabel: 'Dexcom CGM',
    deviceRuntime: 'connected',
    autoRefreshState: 'idle',
    pollIntervalSeconds: env.pollIntervalSeconds,
    nextPollDueAt: nextPollAt(env.pollIntervalSeconds),
    authorizePath: env.authorizeUrl || '',
    dataFreshness: 'live',
    latestGlucose: latest.glucose,
    latestTrend: latest.trend,
    latestTimestamp: latest.timestamp,
    readings,
    pollCount: 1,
    message: 'Dexcom connection is active and polling is ready.',
  };
};

export const disconnectDexcom = (household) => ({
  ...defaultDexcomConnection(),
  message: `Dexcom was disconnected for ${household.householdName || 'this household'}.`,
});

export const pollDexcom = (household) => {
  const current = ensureDexcomConnection(household);
  if (current.status !== 'connected') {
    return {
      ...current,
      message: 'Connect Dexcom before polling for glucose data.',
    };
  }

  const nextPollCount = (current.pollCount || 0) + 1;
  const trend = nextTrend(nextPollCount);
  const glucose = nextGlucose(current.latestGlucose || 102, trend);
  const timestamp = nowIso();
  const readings = [...(Array.isArray(current.readings) ? current.readings : []), {
    id: randomBytes(6).toString('hex'),
    timestamp,
    glucose,
    trend,
  }].slice(-12);

  const artificialAgeMinutes =
    nextPollCount % 9 === 0 ? 52 :
    nextPollCount % 5 === 0 ? 21 :
    nextPollCount % 3 === 0 ? 11 :
    2;
  const freshness = freshnessFromMinutes(artificialAgeMinutes);
  const lastTimestamp = new Date(Date.now() - artificialAgeMinutes * 60 * 1000).toISOString();

  return {
    ...applyPollRecoveryPlan(current, freshness === 'offline' ? 'degraded' : 'healthy'),
    status: freshness === 'offline' ? 'error' : 'connected',
    lastSync: timestamp,
    lastPollAt: timestamp,
    dataFreshness: freshness,
    latestGlucose: glucose,
    latestTrend: trend,
    latestTimestamp: lastTimestamp,
    readings,
    pollCount: nextPollCount,
    tokenStatus: tokenStatusForExpiry(current.tokenExpiresAt),
    requestHealth: requestHealthFromStatus(freshness === 'offline' ? 'error' : 'connected'),
    retryCount: 0,
    rateLimitResetAt: '',
    lastError: '',
    deviceLabel: current.deviceLabel || 'Dexcom CGM',
    deviceRuntime: freshness === 'offline' ? 'offline' : 'connected',
    autoRefreshState: current.autoRefreshState || 'idle',
    message:
      freshness === 'live'
        ? 'Dexcom polling returned fresh glucose data.'
        : freshness === 'delayed'
          ? 'Dexcom data arrived, but the signal is a little delayed.'
          : freshness === 'stale'
            ? 'Dexcom data is stale. The system is lowering confidence until newer readings arrive.'
            : 'Dexcom polling did not return fresh data. The connection may be offline.',
  };
};

export const pollDexcomLive = async (household) => {
  let current = ensureDexcomConnection(household);
  if (shouldRefreshBeforePoll(current)) {
    const refreshed = await refreshDexcomToken({ ...household, dexcom: current });
    current = {
      ...refreshed,
      autoRefreshState: refreshed.status === 'connected' ? 'refreshed' : 'failed',
    };
  } else {
    current = {
      ...current,
      autoRefreshState: 'not_needed',
    };
  }
  if (!current.accessToken) {
    return {
      ...current,
      status: 'error',
      tokenStatus: 'missing',
      nextPollDueAt: '',
      message: 'Dexcom access token is missing. Finish OAuth before polling live data.',
    };
  }

  try {
    const [{ readings, meta: readingMeta }, deviceResponse] = await Promise.all([
      livePollReadings(current),
      livePollDevice(current).catch(() => ({
        device: {
          deviceLabel: current.deviceLabel || 'Dexcom CGM',
          deviceRuntime: current.deviceRuntime || 'unknown',
        },
      })),
    ]);
    const latest = readings[readings.length - 1];
    if (!latest) {
      return applyPollRecoveryPlan({
        ...current,
        status: 'error',
        dataFreshness: 'offline',
        requestHealth: 'failed',
        retryCount: readingMeta.attempts || 0,
        rateLimitResetAt: '',
        lastError: 'Dexcom polling completed, but no glucose readings were returned.',
        message: 'Dexcom polling completed, but no glucose readings were returned.',
      }, 'degraded');
    }

    const ageMinutes = Math.max(0, Math.round((Date.now() - Date.parse(latest.timestamp)) / 60000));
    const freshness = freshnessFromMinutes(ageMinutes);
    return applyPollRecoveryPlan({
      ...current,
      status: freshness === 'offline' ? 'error' : 'connected',
      lastSync: nowIso(),
      lastPollAt: nowIso(),
      latestGlucose: latest.glucose,
      latestTrend: latest.trend,
      latestTimestamp: latest.timestamp,
      readings,
      pollCount: (current.pollCount || 0) + 1,
      dataFreshness: freshness,
      tokenStatus: tokenStatusForExpiry(current.tokenExpiresAt),
      requestHealth: requestHealthFromStatus(freshness === 'offline' ? 'error' : 'connected', readingMeta.attempts || 0),
      retryCount: readingMeta.attempts || 0,
      rateLimitResetAt: readingMeta.rateLimitResetAt || '',
      lastError: '',
      deviceLabel: deviceResponse.device.deviceLabel || current.deviceLabel || 'Dexcom CGM',
      deviceRuntime: freshness === 'offline' ? 'offline' : (deviceResponse.device.deviceRuntime || 'unknown'),
      message:
        freshness === 'live'
          ? 'Dexcom live polling returned fresh glucose data.'
          : freshness === 'delayed'
            ? 'Dexcom live data arrived, but the signal is slightly delayed.'
            : freshness === 'stale'
              ? 'Dexcom live data is stale. The system is lowering confidence until fresher readings arrive.'
            : 'Dexcom live polling did not return fresh data. Check the connection or device sync.',
    }, freshness === 'offline' || freshness === 'stale' ? 'degraded' : 'healthy');
  } catch (error) {
    const dexcomError = error instanceof DexcomApiError ? error : new DexcomApiError(error instanceof Error ? error.message : 'Dexcom live polling failed.');
    return applyPollRecoveryPlan({
      ...current,
      status: 'error',
      dataFreshness: 'offline',
      tokenStatus: tokenStatusForExpiry(current.tokenExpiresAt),
      requestHealth: dexcomError.status === 429 ? 'rate_limited' : 'failed',
      retryCount: current.retryCount || 0,
      rateLimitResetAt: dexcomError.rateLimitResetAt || isoAfterSeconds(dexcomError.retryAfterSeconds),
      lastError: dexcomError.message,
      deviceRuntime: current.deviceRuntime || 'unknown',
      message: dexcomError.message,
    }, dexcomError.status === 429 ? 'rate_limited' : 'degraded', { rateLimitResetAt: dexcomError.rateLimitResetAt || isoAfterSeconds(dexcomError.retryAfterSeconds) });
  }
};

export const dexcomPayloadForHousehold = (household) => {
  const dexcom = ensureDexcomConnection(household);
  const status =
    dexcom.status === 'disconnected'
      ? 'disconnected'
      : dexcom.status === 'error'
        ? 'error'
        : 'connected';

  return {
    provider: 'Dexcom',
    status,
    authMode: dexcom.authMode || 'mock',
    configStatus: dexcom.configStatus || 'missing',
    missingConfig: Array.isArray(dexcom.missingConfig) ? dexcom.missingConfig : dexcomEnvConfig().missingConfig,
    authorizePath: dexcom.authorizePath || '',
    oauthRedirectPath: dexcom.oauthRedirectPath || '/api/dexcom/oauth/callback',
    accountName: dexcom.accountName || '',
    lastSync: dexcom.lastSync || '',
    lastPollAt: dexcom.lastPollAt || '',
    tokenExpiresAt: dexcom.tokenExpiresAt || '',
    refreshTokenExpiresAt: dexcom.refreshTokenExpiresAt || '',
    tokenIssuedAt: dexcom.tokenIssuedAt || '',
    lastTokenRefreshAt: dexcom.lastTokenRefreshAt || '',
    tokenStatus: dexcom.tokenStatus || tokenStatusForExpiry(dexcom.tokenExpiresAt || ''),
    tokenType: dexcom.tokenType || '',
    scope: dexcom.scope || DEXCOM_SCOPES,
    accessTokenPreview: dexcom.accessTokenPreview || '',
    refreshTokenPreview: dexcom.refreshTokenPreview || '',
    hasRefreshToken: Boolean(dexcom.hasRefreshToken || dexcom.refreshToken),
    requestHealth: dexcom.requestHealth || 'healthy',
    retryCount: dexcom.retryCount || 0,
    rateLimitResetAt: dexcom.rateLimitResetAt || '',
    lastError: dexcom.lastError || '',
    deviceLabel: dexcom.deviceLabel || '',
    deviceRuntime: dexcom.deviceRuntime || 'unknown',
    autoRefreshState: dexcom.autoRefreshState || 'idle',
    pollIntervalSeconds: dexcom.pollIntervalSeconds || dexcomEnvConfig().pollIntervalSeconds,
    nextPollDueAt: dexcom.nextPollDueAt || '',
    dataFreshness: dexcom.dataFreshness || 'offline',
    latestGlucose: dexcom.latestGlucose ?? null,
    latestTrend: dexcom.latestTrend || 'unknown',
    latestTimestamp: dexcom.latestTimestamp || '',
    message: dexcom.message || 'Dexcom connection is not ready yet.',
  };
};

export const dexcomOAuthStart = (household, accountName = '') => {
  const env = dexcomEnvConfig();
  if (!env.ready) {
    return {
      dexcom: {
        ...ensureDexcomConnection(household),
        authMode: 'mock',
        configStatus: 'missing',
        status: 'disconnected',
        missingConfig: env.missingConfig,
        oauthRedirectPath: '/api/dexcom/oauth/callback',
        authorizePath: '',
        message: 'Dexcom OAuth is not configured yet. Add server credentials first.',
      },
      redirectUrl: '',
    };
  }

  return {
    dexcom: {
      ...ensureDexcomConnection(household),
      authMode: 'oauth_ready',
      configStatus: 'ready',
      status: 'connected',
      accountName: accountName || household.primaryParent || 'Dexcom Member',
      missingConfig: env.missingConfig,
      oauthRedirectPath: '/api/dexcom/oauth/callback',
      authorizePath: env.authorizeUrl,
      tokenStatus: 'missing',
      requestHealth: 'healthy',
      retryCount: 0,
      rateLimitResetAt: '',
      lastError: '',
      deviceLabel: '',
      deviceRuntime: 'unknown',
      autoRefreshState: 'idle',
      pollIntervalSeconds: env.pollIntervalSeconds,
      nextPollDueAt: '',
      message: 'Dexcom OAuth is configured. Finish the redirect flow to exchange the authorization code.',
    },
    redirectUrl: env.authorizeUrl,
  };
};

export const dexcomOAuthCallback = async (household, code = '') => {
  const env = dexcomEnvConfig();
  if (!env.ready) {
    return {
      ...ensureDexcomConnection(household),
      authMode: 'mock',
      configStatus: 'missing',
      status: 'disconnected',
      missingConfig: env.missingConfig,
      oauthRedirectPath: '/api/dexcom/oauth/callback',
      message: 'Dexcom OAuth callback arrived, but server credentials are still missing.',
    };
  }

  if (env.useLiveMode && code) {
    try {
      const tokenPayload = await liveTokenExchange(code);
      const tokenBundle = tokenBundleFromLivePayload(tokenPayload);
      const seeded = connectDexcom(household, household.primaryParent || 'Dexcom Member');
      return {
      ...seeded,
      authMode: 'oauth_ready',
      configStatus: 'ready',
      ...tokenBundle,
      requestHealth: 'healthy',
      retryCount: 0,
      rateLimitResetAt: '',
      lastError: '',
      tokenStatus: tokenStatusForExpiry(tokenBundle.tokenExpiresAt),
      autoRefreshState: 'idle',
      pollIntervalSeconds: env.pollIntervalSeconds,
      nextPollDueAt: nextPollAt(env.pollIntervalSeconds),
      message: 'Dexcom authorization code received. Live token exchange completed.',
      };
    } catch (error) {
      return {
        ...ensureDexcomConnection(household),
        authMode: 'oauth_ready',
        configStatus: 'ready',
        status: 'error',
        requestHealth: 'failed',
        missingConfig: env.missingConfig,
        oauthRedirectPath: '/api/dexcom/oauth/callback',
        message: error instanceof Error ? error.message : 'Dexcom live token exchange failed.',
      };
    }
  }

  const tokenBundle = buildMockTokenBundle(code || randomBytes(4).toString('hex'));
  return {
    ...connectDexcom(household, household.primaryParent || 'Dexcom Member'),
    authMode: 'oauth_ready',
    configStatus: 'ready',
    ...tokenBundle,
    hasRefreshToken: true,
    requestHealth: 'healthy',
    retryCount: 0,
    rateLimitResetAt: '',
    lastError: '',
    tokenStatus: tokenStatusForExpiry(tokenBundle.tokenExpiresAt),
    autoRefreshState: 'idle',
    pollIntervalSeconds: env.pollIntervalSeconds,
    nextPollDueAt: nextPollAt(env.pollIntervalSeconds),
    message: code
      ? 'Dexcom authorization code received. Token exchange stub completed and polling can continue.'
      : 'Dexcom callback opened without an authorization code.',
  };
};

export const refreshDexcomToken = async (household) => {
  const current = ensureDexcomConnection(household);
  if (!current.refreshToken && !current.hasRefreshToken) {
    return {
      ...current,
      tokenStatus: 'missing',
      requestHealth: 'failed',
      autoRefreshState: 'failed',
      lastError: 'Dexcom refresh token is missing. Run the OAuth flow again before refreshing.',
      message: 'Dexcom refresh token is missing. Run the OAuth flow again before refreshing.',
    };
  }

  const env = dexcomEnvConfig();
  if (env.useLiveMode && current.refreshToken) {
    try {
      const tokenPayload = await liveRefreshExchange(current.refreshToken);
      const refreshed = tokenBundleFromLivePayload(tokenPayload, current.refreshToken);
      return {
        ...current,
        ...refreshed,
        status: 'connected',
        requestHealth: 'healthy',
        retryCount: 0,
        rateLimitResetAt: '',
        lastError: '',
        tokenStatus: tokenStatusForExpiry(refreshed.tokenExpiresAt),
        autoRefreshState: 'refreshed',
        pollIntervalSeconds: env.pollIntervalSeconds,
        nextPollDueAt: nextPollAt(env.pollIntervalSeconds),
        message: 'Dexcom live tokens were refreshed and the next polling window is ready.',
      };
    } catch (error) {
      return {
        ...current,
        status: 'error',
        tokenStatus: tokenStatusForExpiry(current.tokenExpiresAt),
        requestHealth: 'failed',
        autoRefreshState: 'failed',
        lastError: error instanceof Error ? error.message : 'Dexcom live token refresh failed.',
        message: error instanceof Error ? error.message : 'Dexcom live token refresh failed.',
      };
    }
  }

  const refreshed = buildMockTokenBundle('refresh');
  return {
    ...current,
    ...refreshed,
    hasRefreshToken: true,
    status: 'connected',
    requestHealth: 'healthy',
    retryCount: 0,
    rateLimitResetAt: '',
    lastError: '',
    tokenStatus: tokenStatusForExpiry(refreshed.tokenExpiresAt),
    autoRefreshState: 'refreshed',
    pollIntervalSeconds: env.pollIntervalSeconds,
    nextPollDueAt: nextPollAt(env.pollIntervalSeconds),
    message: 'Dexcom tokens were refreshed and the next polling window is ready.',
  };
};
