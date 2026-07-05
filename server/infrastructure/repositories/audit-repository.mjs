const insertSql = `
  INSERT INTO audit_events (id, household_id, actor_user_id, event_type, payload, created_at)
  VALUES ($1, $2, $3, $4, $5::jsonb, COALESCE($6::timestamptz, NOW()))
  ON CONFLICT (id) DO NOTHING
`;

export const insertAuditEventRow = async (pool, event) => {
  if (!pool || !event?.id) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  const {
    id,
    time,
    kind,
    eventType,
    householdId,
    userId,
    actorUserId,
    ...rest
  } = event;

  await pool.query(insertSql, [
    id,
    householdId || null,
    userId || actorUserId || null,
    String(kind || eventType || 'unknown').slice(0, 80),
    JSON.stringify(rest),
    time || null,
  ]);

  return { ok: true };
};
