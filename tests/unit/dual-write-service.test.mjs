import { describe, expect, it } from 'vitest';
import { dualWritePollReadings } from '../../server/infrastructure/repositories/dual-write-service.mjs';

describe('dual-write-service', () => {
  it('skips when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWritePollReadings(
      { id: 'hh-1', householdName: 'Test', inviteCode: 'ABC123' },
      [],
      [{ id: 'r1', timestamp: new Date().toISOString(), glucose: 110, trend: 'flat' }],
    );
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
    expect(result.inserted).toBe(0);
  });

  it('skips when there are no new readings', async () => {
    const reading = { id: 'r1', timestamp: new Date().toISOString(), glucose: 110, trend: 'flat' };
    const result = await dualWritePollReadings({ id: 'hh-1' }, [reading], [reading]);
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('nothing_to_write');
  });
});
