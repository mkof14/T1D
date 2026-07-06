import '../server/load-env.mjs';
import { getPool } from '../server/infrastructure/db.mjs';

const queries = {
  households: 'SELECT COUNT(*)::int AS count FROM households',
  household_members: 'SELECT COUNT(*)::int AS count FROM household_members',
  device_connections: 'SELECT COUNT(*)::int AS count FROM device_connections',
  oauth_credentials: 'SELECT COUNT(*)::int AS count FROM oauth_credentials',
  alerts: 'SELECT COUNT(*)::int AS count FROM alerts',
  notification_deliveries: 'SELECT COUNT(*)::int AS count FROM notification_deliveries',
  escalations: 'SELECT COUNT(*)::int AS count FROM escalations',
  audit_events: 'SELECT COUNT(*)::int AS count FROM audit_events',
  users: 'SELECT COUNT(*)::int AS count FROM users',
  sessions: 'SELECT COUNT(*)::int AS count FROM sessions WHERE revoked_at IS NULL',
  glucose_readings: 'SELECT COUNT(*)::int AS count FROM glucose_readings',
  kv_namespaces: 'SELECT COUNT(DISTINCT namespace)::int AS count FROM t1d_kv',
};

const main = async () => {
  const pool = await getPool();
  if (!pool) {
    console.error('[verify-neon] DATABASE_URL is required');
    process.exit(1);
  }

  try {
    const results = {};
    for (const [key, sql] of Object.entries(queries)) {
      const response = await pool.query(sql);
      results[key] = response.rows[0]?.count ?? 0;
    }

    const latestUsers = await pool.query(
      'SELECT id, email, household_id, updated_at FROM users ORDER BY updated_at DESC LIMIT 5'
    );
    const latestReadings = await pool.query(
      'SELECT id, household_id, glucose_mg_dl, recorded_at FROM glucose_readings ORDER BY recorded_at DESC LIMIT 5'
    );

    console.log(JSON.stringify({
      ok: true,
      counts: results,
      sampleUsers: latestUsers.rows,
      sampleReadings: latestReadings.rows,
    }, null, 2));
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  console.error('[verify-neon] fatal:', error);
  process.exit(1);
});
