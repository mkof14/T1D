import { afterAll, describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import { dualWriteSession, dualWriteUser } from '../../server/infrastructure/repositories/dual-write-service.mjs';
import { findSessionUserFromSql, findUserByEmailFromSql } from '../../server/infrastructure/repositories/sql-read-service.mjs';

const databaseUrl = String(process.env.DATABASE_URL || '').trim();
const describePostgres = databaseUrl ? describe : describe.skip;

describePostgres('sql read path', () => {
  const userId = randomBytes(12).toString('hex');
  const sessionId = randomBytes(18).toString('hex');
  const email = `sql-read-${Date.now()}@example.com`;

  afterAll(async () => {
    const { getPool } = await import('../../server/infrastructure/db.mjs');
    const pool = await getPool();
    if (!pool) return;
    try {
      await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    } finally {
      await pool.end();
    }
  });

  it('reads active session and user from SQL', async () => {
    const userWrite = await dualWriteUser({
      id: userId,
      email,
      passwordHash: 'hash',
      fullName: 'SQL Read Parent',
      role: 'parent',
    });
    expect(userWrite.ok).toBe(true);

    const sessionWrite = await dualWriteSession({
      id: sessionId,
      userId,
      expiresAt: Date.now() + 60_000,
    });
    expect(sessionWrite.ok).toBe(true);

    const byEmail = await findUserByEmailFromSql(email);
    expect(byEmail?.id).toBe(userId);

    const sessionUser = await findSessionUserFromSql(sessionId);
    expect(sessionUser?.user?.email).toBe(email);
    expect(sessionUser?.session?.id).toBe(sessionId);
  });
});
