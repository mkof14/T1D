import { describe, expect, it } from 'vitest';
import { dualWriteHouseholdSnapshot } from '../../server/infrastructure/repositories/dual-write-service.mjs';

describe('dualWriteHouseholdSnapshot', () => {
  it('skips when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWriteHouseholdSnapshot({
      id: 'hh-1',
      householdName: 'Test Circle',
      inviteCode: 'ABC123',
    });
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
  });
});
