import { describe, expect, it } from 'vitest';
import { upsertAlertRow } from '../../server/infrastructure/repositories/alert-repository.mjs';
import { dualWriteAlertCreated } from '../../server/infrastructure/repositories/dual-write-service.mjs';

describe('alert-repository', () => {
  it('skips alert upsert when pool is missing', async () => {
    const result = await upsertAlertRow(null, {
      id: 'alert-1',
      householdId: 'hh-1',
      level: 'watch',
      reason: 'low',
      decision: 'notify',
    });
    expect(result.skipped).toBe(true);
  });

  it('skips alert dual-write when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWriteAlertCreated(
      { id: 'hh-1' },
      { id: 'alert-1', level: 'watch', reason: 'low', ruleVersion: '1.0.0' },
      { decision: 'notify' }
    );
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
  });
});
