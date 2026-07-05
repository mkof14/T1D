const alertInsertSql = `
  INSERT INTO alerts (
    id, household_id, rule_version, level, reason, decision, status, input_snapshot
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    resolved_at = CASE WHEN EXCLUDED.status = 'resolved' THEN NOW() ELSE alerts.resolved_at END
`;

const transitionInsertSql = `
  INSERT INTO alert_transitions (id, alert_id, from_status, to_status, actor_user_id, reason_code)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (id) DO NOTHING
`;

const acknowledgementInsertSql = `
  INSERT INTO acknowledgements (id, alert_id, user_id, channel, status)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (id) DO NOTHING
`;

export const upsertAlertRow = async (pool, alert) => {
  if (!pool || !alert?.id || !alert?.householdId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(alertInsertSql, [
    alert.id,
    alert.householdId,
    String(alert.ruleVersion || '1.0.0').slice(0, 40),
    String(alert.level || 'watch').slice(0, 40),
    String(alert.reason || '').slice(0, 240),
    String(alert.decision || 'notify').slice(0, 40),
    String(alert.status || 'active').slice(0, 40),
    JSON.stringify(alert.inputSnapshot || {}),
  ]);

  return { ok: true };
};

export const insertAlertTransitionRow = async (pool, transition) => {
  if (!pool || !transition?.id || !transition?.alertId || !transition?.toStatus) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(transitionInsertSql, [
    transition.id,
    transition.alertId,
    transition.fromStatus || null,
    transition.toStatus,
    transition.actorUserId || null,
    transition.reasonCode || null,
  ]);

  return { ok: true };
};

export const insertAcknowledgementRow = async (pool, acknowledgement) => {
  if (!pool || !acknowledgement?.id || !acknowledgement?.alertId || !acknowledgement?.userId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(acknowledgementInsertSql, [
    acknowledgement.id,
    acknowledgement.alertId,
    acknowledgement.userId,
    String(acknowledgement.channel || 'in_app').slice(0, 40),
    String(acknowledgement.status || 'acknowledged').slice(0, 40),
  ]);

  return { ok: true };
};

export const resolveAlertRow = async (pool, alertId) => {
  if (!pool || !alertId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(
    `UPDATE alerts SET status = 'resolved', resolved_at = NOW() WHERE id = $1`,
    [alertId]
  );
  return { ok: true };
};
