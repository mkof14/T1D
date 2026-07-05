const upsertSql = `
  INSERT INTO sessions (id, user_id, expires_at, created_at)
  VALUES ($1, $2, $3, COALESCE($4, NOW()))
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    expires_at = EXCLUDED.expires_at,
    revoked_at = NULL
`;

export const upsertSessionRow = async (pool, session) => {
  if (!pool || !session?.id || !session?.userId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  const expiresAt = new Date(Number(session.expiresAt));
  if (Number.isNaN(expiresAt.getTime())) {
    return { ok: false, skipped: true, reason: 'invalid_expires_at' };
  }

  const createdAt = session.createdAt ? new Date(session.createdAt) : null;
  await pool.query(upsertSql, [
    session.id,
    session.userId,
    expiresAt.toISOString(),
    createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toISOString() : null,
  ]);

  return { ok: true };
};

export const revokeSessionRow = async (pool, sessionId) => {
  if (!pool || !sessionId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(
    'UPDATE sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL',
    [sessionId]
  );
  return { ok: true };
};

export const revokeSessionsForUserRows = async (pool, userId) => {
  if (!pool || !userId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(
    'UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId]
  );
  return { ok: true };
};
