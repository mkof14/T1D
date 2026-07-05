import { describe, expect, it } from 'vitest';
import { insertAuditEventRow } from '../../server/infrastructure/repositories/audit-repository.mjs';
import { dualWriteAuditEvent } from '../../server/infrastructure/repositories/dual-write-service.mjs';

describe('audit-repository', () => {
  it('skips insert when pool is missing', async () => {
    const result = await insertAuditEventRow(null, {
      id: 'audit-1',
      kind: 'safety_action',
      householdId: 'hh-1',
      userId: 'user-1',
    });
    expect(result.skipped).toBe(true);
  });

  it('skips dual-write when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWriteAuditEvent({
      id: 'audit-1',
      kind: 'safety_action',
      householdId: 'hh-1',
      userId: 'user-1',
      time: new Date().toISOString(),
    });
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
  });
});
