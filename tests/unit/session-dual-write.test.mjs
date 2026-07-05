import { describe, expect, it } from 'vitest';
import { dualWriteSession, dualWriteRevokeSession } from '../../server/infrastructure/repositories/dual-write-service.mjs';
import { upsertSessionRow, revokeSessionRow } from '../../server/infrastructure/repositories/session-repository.mjs';

describe('session dual-write', () => {
  it('skips session upsert when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWriteSession({
      id: 'sess-1',
      userId: 'user-1',
      expiresAt: Date.now() + 60_000,
    });
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
  });

  it('skips revoke when session id is missing', async () => {
    const result = await dualWriteRevokeSession('');
    expect(result.skipped).toBe(true);
  });

  it('skips repository upsert when required fields are missing', async () => {
    const result = await upsertSessionRow(null, { id: '', userId: '' });
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('missing_fields');
  });

  it('skips repository revoke when session id is missing', async () => {
    const result = await revokeSessionRow(null, '');
    expect(result.skipped).toBe(true);
  });
});
