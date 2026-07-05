const upsertSql = `
  INSERT INTO users (
    id, email, password_hash, full_name, role, organization,
    google_id, auth_provider, household_id, created_at, updated_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, NOW()), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    organization = EXCLUDED.organization,
    google_id = EXCLUDED.google_id,
    auth_provider = EXCLUDED.auth_provider,
    household_id = EXCLUDED.household_id,
    updated_at = NOW()
`;

export const upsertUserRow = async (pool, user) => {
  if (!pool || !user?.id || !user?.email) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  await pool.query(upsertSql, [
    user.id,
    String(user.email).slice(0, 320),
    user.passwordHash || null,
    String(user.fullName || '').slice(0, 160),
    String(user.role || 'parent').slice(0, 40),
    String(user.organization || '').slice(0, 160),
    user.googleId || null,
    user.authProvider || null,
    user.householdId || null,
    user.createdAt || null,
  ]);

  return { ok: true, skipped: false };
};
