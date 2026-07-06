const upsertDeliverySql = `
  INSERT INTO notification_deliveries (
    id, alert_id, household_id, channel, state, recipient_role, payload, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, COALESCE($8::timestamptz, NOW()), NOW())
  ON CONFLICT (id) DO UPDATE SET
    state = EXCLUDED.state,
    payload = EXCLUDED.payload,
    updated_at = NOW()
`;

export const upsertNotificationDeliveryRow = async (pool, delivery) => {
  if (!pool || !delivery?.id || !delivery?.householdId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(upsertDeliverySql, [
    delivery.id,
    delivery.alertId || null,
    delivery.householdId,
    String(delivery.channel || 'in_app').slice(0, 32),
    String(delivery.state || 'created').slice(0, 32),
    delivery.recipientRole ? String(delivery.recipientRole).slice(0, 40) : null,
    JSON.stringify(delivery.payload || {}),
    delivery.createdAt || null,
  ]);

  return { ok: true, skipped: false };
};

const insertEscalationSql = `
  INSERT INTO escalations (id, alert_id, from_role, to_role, reason, created_at)
  VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()))
  ON CONFLICT (id) DO NOTHING
`;

export const insertEscalationRow = async (pool, escalation) => {
  if (!pool || !escalation?.id || !escalation?.alertId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(insertEscalationSql, [
    escalation.id,
    escalation.alertId,
    escalation.fromRole ? String(escalation.fromRole).slice(0, 40) : null,
    String(escalation.toRole || 'caregiver').slice(0, 40),
    String(escalation.reason || '').slice(0, 240),
    escalation.createdAt || null,
  ]);

  return { ok: true, skipped: false };
};
