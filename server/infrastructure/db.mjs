import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPool = async () => {
  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) return null;
  const { default: pg } = await import('pg');
  return new pg.Pool({ connectionString: databaseUrl, max: 4 });
};

export const runMigrations = async () => {
  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }
  const sql = readFileSync(join(__dirname, 'migrations', '001_core_schema.sql'), 'utf8');
  await pool.query(sql);
  await pool.end();
  return { ok: true, applied: ['001_core_schema.sql'] };
};
