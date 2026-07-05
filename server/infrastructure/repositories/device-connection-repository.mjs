const parseTimestamp = (value) => {
  if (!value) return null;
  const parsed = Date.parse(String(value));
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
};

const deviceUpsertSql = `
  INSERT INTO device_connections (
    id, household_id, provider, status, last_sync_at, last_reading_at,
    token_status, worker_heartbeat_at, stale_data_flag, metadata, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    last_sync_at = EXCLUDED.last_sync_at,
    last_reading_at = EXCLUDED.last_reading_at,
    token_status = EXCLUDED.token_status,
    worker_heartbeat_at = EXCLUDED.worker_heartbeat_at,
    stale_data_flag = EXCLUDED.stale_data_flag,
    metadata = EXCLUDED.metadata,
    updated_at = NOW()
`;

const oauthUpsertSql = `
  INSERT INTO oauth_credentials (
    id, household_id, provider, access_token_enc, refresh_token_enc,
    expires_at, refresh_expires_at, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  ON CONFLICT (id) DO UPDATE SET
    access_token_enc = EXCLUDED.access_token_enc,
    refresh_token_enc = EXCLUDED.refresh_token_enc,
    expires_at = EXCLUDED.expires_at,
    refresh_expires_at = EXCLUDED.refresh_expires_at,
    updated_at = NOW()
`;

const oauthClearSql = `
  UPDATE oauth_credentials
  SET access_token_enc = NULL,
      refresh_token_enc = NULL,
      expires_at = NULL,
      refresh_expires_at = NULL,
      updated_at = NOW()
  WHERE id = $1
`;

export const upsertDexcomDeviceConnection = async (pool, household) => {
  if (!pool || !household?.id) {
    return { ok: false, skipped: true, reason: 'missing_pool_or_household' };
  }

  const dexcom = household.dexcom && typeof household.dexcom === 'object' ? household.dexcom : {};
  const connectionId = `${household.id}-dexcom`;
  const freshness = String(dexcom.dataFreshness || 'offline');

  await pool.query(deviceUpsertSql, [
    connectionId,
    household.id,
    'dexcom',
    String(dexcom.status || 'disconnected').slice(0, 40),
    parseTimestamp(dexcom.lastSync || dexcom.lastPollAt),
    parseTimestamp(dexcom.latestTimestamp),
    String(dexcom.tokenStatus || 'missing').slice(0, 40),
    parseTimestamp(dexcom.lastPollAt),
    freshness === 'stale' || freshness === 'offline',
    JSON.stringify({
      configStatus: dexcom.configStatus || 'missing',
      dataFreshness: freshness,
      authMode: dexcom.authMode || 'mock',
      message: String(dexcom.message || '').slice(0, 240),
      latestGlucose: dexcom.latestGlucose ?? null,
      latestTrend: dexcom.latestTrend || 'unknown',
    }),
  ]);

  return { ok: true, connectionId };
};

export const upsertDexcomOAuthCredentials = async (pool, household) => {
  if (!pool || !household?.id) {
    return { ok: false, skipped: true, reason: 'missing_pool_or_household' };
  }

  const dexcom = household.dexcom && typeof household.dexcom === 'object' ? household.dexcom : {};
  const credentialId = `${household.id}-dexcom-oauth`;
  const status = String(dexcom.status || 'disconnected');
  const hasTokens = Boolean(dexcom.accessTokenEnc || dexcom.refreshTokenEnc);

  if (status === 'disconnected' && !hasTokens) {
    await pool.query(oauthClearSql, [credentialId]);
    return { ok: true, cleared: true, credentialId };
  }

  await pool.query(oauthUpsertSql, [
    credentialId,
    household.id,
    'dexcom',
    dexcom.accessTokenEnc || null,
    dexcom.refreshTokenEnc || null,
    parseTimestamp(dexcom.tokenExpiresAt),
    parseTimestamp(dexcom.refreshTokenExpiresAt),
  ]);

  return { ok: true, cleared: false, credentialId };
};

export const syncDexcomConnectionRows = async (pool, household) => {
  await upsertDexcomDeviceConnection(pool, household);
  await upsertDexcomOAuthCredentials(pool, household);
  return { ok: true };
};
