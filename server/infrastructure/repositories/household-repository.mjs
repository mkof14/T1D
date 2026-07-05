const upsertSql = `
  INSERT INTO households (id, household_name, child_name, invite_code, created_by, updated_at)
  VALUES ($1, $2, $3, $4, $5, NOW())
  ON CONFLICT (id) DO UPDATE SET
    household_name = EXCLUDED.household_name,
    child_name = EXCLUDED.child_name,
    invite_code = EXCLUDED.invite_code,
    updated_at = NOW()
`;

export const ensureHouseholdRow = async (pool, household) => {
  if (!pool || !household?.id) {
    return { ok: false, skipped: true, reason: 'missing_pool_or_household' };
  }

  const inviteCode = String(household.inviteCode || household.invite_code || 'UNKNOWN').slice(0, 40);
  await pool.query(upsertSql, [
    household.id,
    String(household.householdName || household.household_name || 'Household').slice(0, 200),
    String(household.childName || household.child_name || '').slice(0, 120),
    inviteCode,
    household.createdBy || household.created_by || null,
  ]);

  return { ok: true };
};
