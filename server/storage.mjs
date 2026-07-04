import { promises as fs } from 'node:fs';
import path from 'node:path';

let pool = null;
let dataDir = '';
let storageBackend = 'json';

const namespaceForFile = (filePath) => {
  const base = path.basename(filePath, '.json');
  return `t1d_${base}`;
};

const initPool = async () => {
  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) return null;
  if (pool) return pool;

  const { default: pg } = await import('pg');
  pool = new pg.Pool({ connectionString: databaseUrl, max: 4 });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS t1d_kv (
      namespace TEXT NOT NULL,
      key TEXT NOT NULL DEFAULT 'default',
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (namespace, key)
    )
  `);
  storageBackend = 'postgres';
  return pool;
};

export const createStorage = ({ dataDirectory }) => {
  dataDir = dataDirectory;

  const ensureDir = async () => {
    await fs.mkdir(dataDir, { recursive: true });
  };

  const readJsonFile = async (filePath, fallback) => {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const writeJsonFile = async (filePath, value) => {
    await ensureDir();
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));
  };

  const read = async (filePath, fallback) => {
    const activePool = await initPool();
    if (!activePool) {
      return readJsonFile(filePath, fallback);
    }

    const namespace = namespaceForFile(filePath);
    const result = await activePool.query(
      'SELECT value FROM t1d_kv WHERE namespace = $1 AND key = $2 LIMIT 1',
      [namespace, 'default']
    );
    if (result.rows.length === 0) {
      const existing = await readJsonFile(filePath, fallback);
      if (existing !== fallback) {
        await write(filePath, existing);
      }
      return existing;
    }
    return result.rows[0].value;
  };

  const write = async (filePath, value) => {
    const activePool = await initPool();
    if (!activePool) {
      await writeJsonFile(filePath, value);
      return;
    }

    const namespace = namespaceForFile(filePath);
    await activePool.query(
      `INSERT INTO t1d_kv (namespace, key, value, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (namespace, key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [namespace, 'default', value]
    );
    await writeJsonFile(filePath, value);
  };

  return { read, write };
};

export const getStorageBackend = () => storageBackend;
