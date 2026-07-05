const upsertSql = `
  INSERT INTO households (id, household_name, child_name, invite_code, created_by, updated_at)
  VALUES ($1, $2, $3, $4, $5, NOW())
  ON CONFLICT (id) DO UPDATE SET
    household_name = EXCLUDED.household_name,
    child_name = EXCLUDED.child_name,
    invite_code = EXCLUDED.invite_code,
    updated_at = NOW()
`;

const memberUpsertSql = `
  INSERT INTO household_members (id, household_id, user_id, full_name, email, role, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    status = EXCLUDED.status
`;

const memberKey = (member, index, householdId) => {
  const id = String(member?.id || '').trim();
  if (id) return id.slice(0, 64);
  const userId = String(member?.userId || member?.user_id || '').trim();
  if (userId) return `${householdId}-${userId}`.slice(0, 64);
  return `${householdId}-member-${index}`.slice(0, 64);
};

export const syncHouseholdMembers = async (pool, household) => {
  if (!pool || !household?.id) {
    return { ok: false, skipped: true, reason: 'missing_pool_or_household', synced: 0 };
  }

  const members = Array.isArray(household.members) ? household.members : [];
  const memberIds = [];

  for (const [index, member] of members.entries()) {
    const id = memberKey(member, index, household.id);
    memberIds.push(id);
    await pool.query(memberUpsertSql, [
      id,
      household.id,
      member?.userId || member?.user_id || null,
      String(member?.fullName || member?.full_name || '').slice(0, 120),
      String(member?.email || '').slice(0, 200),
      String(member?.role || 'parent').slice(0, 40),
      String(member?.status || 'active').slice(0, 40),
    ]);
  }

  if (memberIds.length > 0) {
    await pool.query(
      `DELETE FROM household_members WHERE household_id = $1 AND NOT (id = ANY($2::text[]))`,
      [household.id, memberIds]
    );
  } else {
    await pool.query('DELETE FROM household_members WHERE household_id = $1', [household.id]);
  }

  return { ok: true, synced: memberIds.length };
};

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

  await syncHouseholdMembers(pool, household);

  return { ok: true };
};
