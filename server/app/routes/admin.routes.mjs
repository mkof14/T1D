import { getStorageBackend, probeStorage } from '../../storage.mjs';
import { dexcomEnvConfig } from '../../dexcom-service.mjs';
import { isUpstashRateLimitEnabled } from '../../rate-limit.mjs';
import { ALERT_RULE_VERSION } from '../../domain/alerts/alert-rules.mjs';
import { getSqlReadMode } from '../../infrastructure/repositories/sql-read-service.mjs';
import { getPool } from '../../infrastructure/db.mjs';
import { listDeliveriesForHousehold } from '../../services/notification-service.mjs';

const authorizeAdmin = (req, res, sendJson, safeEqualString, CRON_SECRET) => {
  const adminSecret = String(process.env.T1D_ADMIN_SECRET || CRON_SECRET || '').trim();
  if (!adminSecret) {
    sendJson(res, 503, { error: 'Admin access is not configured' });
    return false;
  }

  const authHeader = String(req.headers.authorization || '');
  if (!safeEqualString(authHeader, `Bearer ${adminSecret}`)) {
    sendJson(res, 401, { error: 'Unauthorized admin request' });
    return false;
  }

  return true;
};

const countKvHouseholds = async (readJson, DATA_DIR) => {
  const householdsPayload = await readJson(`${DATA_DIR}/households.json`, { households: [] });
  const usersPayload = await readJson(`${DATA_DIR}/users.json`, { users: [] });
  const households = Array.isArray(householdsPayload.households) ? householdsPayload.households : [];
  const users = Array.isArray(usersPayload.users) ? usersPayload.users : [];
  const activeAlerts = households.filter((household) =>
    ['parent_alerted', 'parent_handling', 'caregiver_escalated', 'caregiver_active'].includes(household?.safetyState?.stage)
  ).length;

  return {
    households: households.length,
    users: users.length,
    activeAlerts,
    inMemoryNotifications: households.reduce(
      (total, household) => total + listDeliveriesForHousehold(household.id).length,
      0,
    ),
  };
};

const countSqlSummary = async () => {
  const pool = await getPool();
  if (!pool) return null;

  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM households) AS households,
        (SELECT COUNT(*)::int FROM users) AS users,
        (SELECT COUNT(*)::int FROM alerts WHERE status = 'active') AS active_alerts,
        (SELECT COUNT(*)::int FROM notification_deliveries) AS notification_deliveries,
        (SELECT COUNT(*)::int FROM escalations) AS escalations,
        (SELECT COUNT(*)::int FROM glucose_readings) AS glucose_readings,
        (SELECT COUNT(*)::int FROM audit_events) AS audit_events
    `);
    return result.rows[0] || null;
  } finally {
    await pool.end();
  }
};

export const handleAdminRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    sendJson,
    safeEqualString,
    CRON_SECRET,
    readJson,
    DATA_DIR,
  } = ctx;

  if (!url.pathname.startsWith('/api/admin/')) {
    return false;
  }

  if (!authorizeAdmin(req, res, sendJson, safeEqualString, CRON_SECRET)) {
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/summary') {
    const storageProbe = await probeStorage();
    const kvCounts = await countKvHouseholds(readJson, DATA_DIR);
    const sqlCounts = await countSqlSummary();

    sendJson(res, 200, {
      ok: true,
      service: 't1d-api',
      timestamp: new Date().toISOString(),
      storage: storageProbe.backend || getStorageBackend(),
      sqlRead: getSqlReadMode(),
      rateLimit: isUpstashRateLimitEnabled() ? 'upstash' : 'memory',
      dexcomLive: dexcomEnvConfig().useLiveMode,
      alertRuleVersion: ALERT_RULE_VERSION,
      kv: kvCounts,
      sql: sqlCounts,
      recommendations: [
        sqlCounts ? null : 'Set DATABASE_URL and run npm run db:backfill',
        getSqlReadMode() === 'off' ? 'Enable T1D_SQL_READ_SHADOW=true on production after parity' : null,
        getSqlReadMode() === 'shadow' ? 'Watch logs; then set T1D_SQL_READ=true' : null,
        dexcomEnvConfig().useLiveMode ? null : 'Add Dexcom credentials for live CGM',
      ].filter(Boolean),
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/households') {
    const householdsPayload = await readJson(`${DATA_DIR}/households.json`, { households: [] });
    const households = Array.isArray(householdsPayload.households) ? householdsPayload.households : [];
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || 20)));

    sendJson(res, 200, {
      ok: true,
      total: households.length,
      items: households.slice(0, limit).map((household) => ({
        id: household.id,
        householdName: household.householdName,
        diabetesType: household.diabetesType,
        stage: household.safetyState?.stage || 'monitoring',
        responderState: household.safetyState?.responderOwnership?.state || 'no_responder',
        alertsCount: household.safetyState?.alertsCount || 0,
        dexcomStatus: household.dexcom?.status || 'disconnected',
        updatedAt: household.updatedAt,
      })),
    });
    return true;
  }

  sendJson(res, 404, { error: 'Not found' });
  return true;
};
