import '../server/load-env.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStorage } from '../server/storage.mjs';
import { getPool } from '../server/infrastructure/db.mjs';
import { runMigrations } from '../server/infrastructure/db.mjs';
import { ensureHouseholdRow } from '../server/infrastructure/repositories/household-repository.mjs';
import { dualWriteHouseholdReadings, dualWriteUsers, dualWriteDexcomConnection } from '../server/infrastructure/repositories/dual-write-service.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.T1D_DATA_DIR || path.join(__dirname, '..', 'server', 'data');
const HOUSEHOLDS_FILE = path.join(DATA_DIR, 'households.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const storage = createStorage({ dataDirectory: DATA_DIR });

const main = async () => {
  const pool = await getPool();
  if (!pool) {
    console.error('[backfill] DATABASE_URL is required');
    process.exit(1);
  }
  await pool.end();

  const migration = await runMigrations();
  console.log('[backfill] migrations:', migration);

  const payload = await storage.read(HOUSEHOLDS_FILE, { households: [] });
  const households = Array.isArray(payload.households) ? payload.households : [];
  const usersPayload = await storage.read(USERS_FILE, { users: [] });
  const users = Array.isArray(usersPayload.users) ? usersPayload.users : [];

  let householdsUpserted = 0;
  let readingsInserted = 0;
  let usersUpserted = 0;
  let failures = 0;

  const userResults = await dualWriteUsers(users);
  usersUpserted = userResults.filter((entry) => entry.ok && !entry.skipped).length;
  failures += userResults.filter((entry) => !entry.ok && !entry.skipped).length;

  for (const household of households) {
    if (!household?.id) continue;

    const upsertPool = await getPool();
    if (!upsertPool) break;

    try {
      await ensureHouseholdRow(upsertPool, household);
      householdsUpserted += 1;
    } catch (error) {
      failures += 1;
      console.warn(`[backfill] household ${household.id}:`, error?.message || error);
    } finally {
      await upsertPool.end();
    }

    const writeResult = await dualWriteHouseholdReadings(household);
    if (writeResult.ok) {
      readingsInserted += writeResult.inserted || 0;
    } else if (!writeResult.skipped) {
      failures += 1;
      console.warn(`[backfill] readings ${household.id}:`, writeResult.error || 'failed');
    }

    const dexcomResult = await dualWriteDexcomConnection(household);
    if (!dexcomResult.ok && !dexcomResult.skipped) {
      failures += 1;
      console.warn(`[backfill] dexcom ${household.id}:`, dexcomResult.error || 'failed');
    }
  }

  console.log(JSON.stringify({
    ok: failures === 0,
    households: households.length,
    householdsUpserted,
    readingsInserted,
    users: users.length,
    usersUpserted,
    failures,
  }, null, 2));

  process.exit(failures > 0 ? 1 : 0);
};

main().catch((error) => {
  console.error('[backfill] fatal:', error);
  process.exit(1);
});
