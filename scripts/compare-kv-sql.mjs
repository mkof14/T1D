import '../server/load-env.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage } from '../server/storage.mjs';
import { getPool } from '../server/infrastructure/db.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.T1D_DATA_DIR || path.join(__dirname, '..', 'server', 'data');
const HOUSEHOLDS_FILE = path.join(DATA_DIR, 'households.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-log.json');

const storage = createStorage({ dataDirectory: DATA_DIR });

const countMembers = (households = []) =>
  households.reduce((total, household) => total + (Array.isArray(household.members) ? household.members.length : 0), 0);

const main = async () => {
  const pool = await getPool();
  if (!pool) {
    console.error('[compare-kv-sql] DATABASE_URL is required');
    process.exit(1);
  }

  try {
    const householdsPayload = await storage.read(HOUSEHOLDS_FILE, { households: [] });
    const usersPayload = await storage.read(USERS_FILE, { users: [] });
    const auditPayload = await storage.read(AUDIT_FILE, { events: [] });
    const households = Array.isArray(householdsPayload.households) ? householdsPayload.households : [];
    const users = Array.isArray(usersPayload.users) ? usersPayload.users : [];
    const auditEvents = Array.isArray(auditPayload.events) ? auditPayload.events : [];

    const kvCounts = {
      households: households.length,
      household_members: countMembers(households),
      users: users.length,
      audit_events: auditEvents.length,
    };

    const sqlResult = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM households) AS households,
        (SELECT COUNT(*)::int FROM household_members) AS household_members,
        (SELECT COUNT(*)::int FROM users) AS users,
        (SELECT COUNT(*)::int FROM sessions WHERE revoked_at IS NULL) AS sessions,
        (SELECT COUNT(*)::int FROM alerts) AS alerts,
        (SELECT COUNT(*)::int FROM audit_events) AS audit_events
    `);
    const sqlCounts = sqlResult.rows[0] || {};

    const mismatches = ['households', 'household_members', 'users']
      .filter((key) => kvCounts[key] !== sqlCounts[key]);
    const notes = [];
    if (kvCounts.audit_events !== sqlCounts.audit_events) {
      notes.push('audit_events differ (historical KV-only events may not be in SQL yet)');
    }

    console.log(JSON.stringify({
      ok: mismatches.length === 0,
      kv: kvCounts,
      sql: sqlCounts,
      mismatches,
      notes,
    }, null, 2));

    process.exit(mismatches.length === 0 ? 0 : 1);
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  console.error('[compare-kv-sql] fatal:', error);
  process.exit(1);
});
