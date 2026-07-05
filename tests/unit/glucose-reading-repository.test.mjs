import { describe, expect, it } from 'vitest';
import { insertGlucoseReading } from '../../server/infrastructure/repositories/glucose-reading-repository.mjs';

describe('glucose-reading-repository', () => {
  it('skips insert when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await insertGlucoseReading({
      id: 'gr-test-1',
      householdId: 'hh-test',
      recordedAt: new Date().toISOString(),
      glucoseMgDl: 110,
      trend: 'flat',
    });
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('skips insert when required fields are missing', async () => {
    const result = await insertGlucoseReading({ id: '', householdId: 'hh-test' });
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('missing_fields');
  });
});
