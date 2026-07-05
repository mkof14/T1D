import { describe, expect, it } from 'vitest';
import {
  getSqlReadMode,
  isSqlReadEnabled,
  isSqlReadShadowEnabled,
  mapSessionRow,
  mapUserRow,
  findSessionUserFromSql,
} from '../../server/infrastructure/repositories/sql-read-service.mjs';

describe('sql-read-service', () => {
  it('maps user rows to app shape', () => {
    const user = mapUserRow({
      id: 'user-1',
      email: 'parent@example.com',
      password_hash: 'hash',
      full_name: 'Parent',
      role: 'parent',
      organization: 'Org',
      google_id: null,
      auth_provider: null,
      household_id: 'hh-1',
      created_at: '2026-07-05T00:00:00.000Z',
    });

    expect(user).toMatchObject({
      id: 'user-1',
      email: 'parent@example.com',
      passwordHash: 'hash',
      fullName: 'Parent',
      householdId: 'hh-1',
    });
  });

  it('maps session rows to app shape', () => {
    const session = mapSessionRow({
      id: 'sess-1',
      user_id: 'user-1',
      expires_at: '2026-07-06T00:00:00.000Z',
    });

    expect(session?.id).toBe('sess-1');
    expect(session?.userId).toBe('user-1');
    expect(typeof session?.expiresAt).toBe('number');
  });

  it('defaults sql read mode to off', () => {
    const previousRead = process.env.T1D_SQL_READ;
    const previousShadow = process.env.T1D_SQL_READ_SHADOW;
    delete process.env.T1D_SQL_READ;
    delete process.env.T1D_SQL_READ_SHADOW;
    expect(isSqlReadEnabled()).toBe(false);
    expect(isSqlReadShadowEnabled()).toBe(false);
    expect(getSqlReadMode()).toBe('off');
    if (previousRead) process.env.T1D_SQL_READ = previousRead;
    if (previousShadow) process.env.T1D_SQL_READ_SHADOW = previousShadow;
  });

  it('reports shadow mode separately from primary', () => {
    const previousRead = process.env.T1D_SQL_READ;
    const previousShadow = process.env.T1D_SQL_READ_SHADOW;
    delete process.env.T1D_SQL_READ;
    process.env.T1D_SQL_READ_SHADOW = 'true';
    expect(getSqlReadMode()).toBe('shadow');
    process.env.T1D_SQL_READ = 'true';
    expect(getSqlReadMode()).toBe('primary');
    if (previousRead) process.env.T1D_SQL_READ = previousRead;
    else delete process.env.T1D_SQL_READ;
    if (previousShadow) process.env.T1D_SQL_READ_SHADOW = previousShadow;
    else delete process.env.T1D_SQL_READ_SHADOW;
  });

  it('returns null when DATABASE_URL is not set', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    const result = await findSessionUserFromSql('sess-1');
    if (previous) process.env.DATABASE_URL = previous;
    expect(result).toBeNull();
  });
});
