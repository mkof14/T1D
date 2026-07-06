const upsertSql = `
  INSERT INTO push_subscriptions (
    id, user_id, household_id, user_role, endpoint, p256dh, auth_key, updated_at
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  ON CONFLICT (endpoint) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    household_id = EXCLUDED.household_id,
    user_role = EXCLUDED.user_role,
    p256dh = EXCLUDED.p256dh,
    auth_key = EXCLUDED.auth_key,
    updated_at = NOW()
`;

const deleteByEndpointSql = `
  DELETE FROM push_subscriptions WHERE endpoint = $1
`;

export const upsertPushSubscriptionRow = async (pool, subscription) => {
  if (!pool || !subscription?.id || !subscription?.endpoint) {
    return { ok: false, skipped: true, reason: 'missing_pool_or_subscription' };
  }

  await pool.query(upsertSql, [
    subscription.id,
    subscription.userId,
    subscription.householdId,
    subscription.userRole,
    subscription.endpoint,
    subscription.keys?.p256dh || '',
    subscription.keys?.auth || '',
  ]);

  return { ok: true };
};

export const deletePushSubscriptionRow = async (pool, endpoint) => {
  if (!pool || !endpoint) {
    return { ok: false, skipped: true, reason: 'missing_pool_or_endpoint' };
  }

  await pool.query(deleteByEndpointSql, [endpoint]);
  return { ok: true };
};
