import { describe, expect, it } from 'vitest';
import {
  upsertDexcomDeviceConnection,
  upsertDexcomOAuthCredentials,
} from '../../server/infrastructure/repositories/device-connection-repository.mjs';
import { dualWriteDexcomConnection } from '../../server/infrastructure/repositories/dual-write-service.mjs';

describe('device-connection-repository', () => {
  it('skips device upsert when pool is missing', async () => {
    const result = await upsertDexcomDeviceConnection(null, { id: 'hh-1', dexcom: { status: 'connected' } });
    expect(result.skipped).toBe(true);
  });

  it('skips oauth upsert when pool is missing', async () => {
    const result = await upsertDexcomOAuthCredentials(null, { id: 'hh-1', dexcom: { status: 'disconnected' } });
    expect(result.skipped).toBe(true);
  });

  it('skips dexcom dual-write when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWriteDexcomConnection({ id: 'hh-1', dexcom: { status: 'connected' } });
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
  });
});
