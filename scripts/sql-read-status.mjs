import '../server/load-env.mjs';
import { getSqlReadMode, isSqlReadEnabled, isSqlReadShadowEnabled } from '../server/infrastructure/repositories/sql-read-service.mjs';
import { getPool } from '../server/infrastructure/db.mjs';
import { probeStorage } from '../server/storage.mjs';

const steps = [];

if (!process.env.DATABASE_URL) {
  steps.push('Set DATABASE_URL in .env.local');
} else {
  steps.push('Run npm run verify:neon and npm run compare:sql');
}

if (!isSqlReadShadowEnabled() && !isSqlReadEnabled()) {
  steps.push('Set T1D_SQL_READ_SHADOW=true locally or on Vercel via sync-vercel-env.mjs');
}

if (isSqlReadShadowEnabled() && !isSqlReadEnabled()) {
  steps.push('Watch Vercel logs for [t1d-api] sql-read shadow mismatch');
  steps.push('When clean, set T1D_SQL_READ=true and redeploy');
}

if (isSqlReadEnabled()) {
  steps.push('SQL primary read is enabled — monitor auth/session flows');
}

const main = async () => {
  const storageProbe = await probeStorage();
  const pool = await getPool();
  let sqlConnected = false;

  if (pool) {
    try {
      await pool.query('SELECT 1');
      sqlConnected = true;
    } finally {
      await pool.end();
    }
  }

  console.log(JSON.stringify({
    ok: Boolean(process.env.DATABASE_URL) && sqlConnected,
    mode: getSqlReadMode(),
    shadowEnabled: isSqlReadShadowEnabled(),
    primaryEnabled: isSqlReadEnabled(),
    storage: storageProbe.backend,
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    sqlConnected,
    nextSteps: steps,
  }, null, 2));

  process.exit(process.env.DATABASE_URL && sqlConnected ? 0 : 1);
};

main().catch((error) => {
  console.error('[sql-read-status] fatal:', error);
  process.exit(1);
});
