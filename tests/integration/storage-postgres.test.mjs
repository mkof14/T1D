import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const databaseUrl = String(process.env.DATABASE_URL || '').trim();
const describePostgres = databaseUrl ? describe : describe.skip;

describePostgres('postgres storage', () => {
  let dataDir;
  let storageModule;

  beforeAll(async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), 't1d-pg-'));
    process.env.T1D_DATA_DIR = dataDir;
    storageModule = await import('../../server/storage.mjs');
  });

  afterAll(() => {
    rmSync(dataDir, { recursive: true, force: true });
  });

  it('uses postgres backend when DATABASE_URL is configured', async () => {
    const storage = storageModule.createStorage({ dataDirectory: dataDir });
    const filePath = path.join(dataDir, 'pg-smoke.json');
    const payload = { ok: true, time: new Date().toISOString() };

    await storage.write(filePath, payload);
    const readBack = await storage.read(filePath, { ok: false });
    expect(readBack).toEqual(payload);
    expect(storageModule.getStorageBackend()).toBe('postgres');
  });

  it('persists values across fresh storage instances', async () => {
    const filePath = path.join(dataDir, 'pg-persist.json');
    const first = storageModule.createStorage({ dataDirectory: dataDir });
    await first.write(filePath, { count: 7 });

    const second = storageModule.createStorage({ dataDirectory: dataDir });
    const readBack = await second.read(filePath, { count: 0 });
    expect(readBack.count).toBe(7);
  });
});
