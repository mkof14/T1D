import { describe, expect, it } from 'vitest';
import { upsertUserRow } from '../../server/infrastructure/repositories/user-repository.mjs';
import { dualWriteUser } from '../../server/infrastructure/repositories/dual-write-service.mjs';

describe('user-repository', () => {
  it('skips upsert when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await dualWriteUser({
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'parent',
    });
    if (previous) process.env.DATABASE_URL = previous;
    expect(result.skipped).toBe(true);
  });

  it('skips upsert when required fields are missing', async () => {
    const result = await upsertUserRow(null, { id: '', email: '' });
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('missing_fields');
  });
});
