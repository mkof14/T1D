import { getPool } from '../db.mjs';

export const isSqlReadEnabled = () => {
  const flag = String(process.env.T1D_SQL_READ || '').trim().toLowerCase();
  if (flag === 'true' || flag === '1') return true;
  if (flag === 'false' || flag === '0') return false;
  return false;
};

export const isSqlReadShadowEnabled = () => {
  const flag = String(process.env.T1D_SQL_READ_SHADOW || '').trim().toLowerCase();
  return flag === 'true' || flag === '1';
};

export const mapUserRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash || undefined,
    fullName: row.full_name || '',
    role: row.role || 'parent',
    organization: row.organization || '',
    googleId: row.google_id || undefined,
    authProvider: row.auth_provider || undefined,
    householdId: row.household_id || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
};

export const mapSessionRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    expiresAt: new Date(row.expires_at).getTime(),
  };
};

export const findSessionUserFromSql = async (sessionId) => {
  if (!sessionId) return null;

  const pool = await getPool();
  if (!pool) return null;

  try {
    const sessionResult = await pool.query(
      `SELECT id, user_id, expires_at
       FROM sessions
       WHERE id = $1
         AND revoked_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [sessionId]
    );
    if (sessionResult.rows.length === 0) return null;

    const session = mapSessionRow(sessionResult.rows[0]);
    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role, organization,
              google_id, auth_provider, household_id, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [session.userId]
    );
    if (userResult.rows.length === 0) return null;

    const user = mapUserRow(userResult.rows[0]);
    return user ? { session, user } : null;
  } finally {
    await pool.end();
  }
};

export const findUserByEmailFromSql = async (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;

  const pool = await getPool();
  if (!pool) return null;

  try {
    const userResult = await pool.query(
      `SELECT id, email, password_hash, full_name, role, organization,
              google_id, auth_provider, household_id, created_at
       FROM users
       WHERE lower(email) = $1
       LIMIT 1`,
      [normalized]
    );
    return mapUserRow(userResult.rows[0] || null);
  } finally {
    await pool.end();
  }
};

export const getSqlReadMode = () => {
  if (isSqlReadEnabled()) return 'primary';
  if (isSqlReadShadowEnabled()) return 'shadow';
  return 'off';
};

export const mapMemberRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || undefined,
    fullName: row.full_name || '',
    email: row.email || '',
    role: row.role || 'parent',
    status: row.status || 'active',
  };
};

export const mapHouseholdRow = (row, members = []) => {
  if (!row) return null;
  return {
    id: row.id,
    householdName: row.household_name || '',
    childName: row.child_name || '',
    inviteCode: row.invite_code || '',
    members: members.map(mapMemberRow).filter(Boolean),
  };
};

export const householdSqlShadowFingerprint = (household) => {
  if (!household) return null;
  const members = (Array.isArray(household.members) ? household.members : [])
    .map((member) => `${member.id}:${member.email}:${member.role}:${member.status || 'active'}`)
    .sort()
    .join('|');
  return `${household.id}:${household.inviteCode || ''}:${household.childName || ''}:${household.householdName || ''}:${members}`;
};

export const mergeHouseholdMetadata = (kvHousehold, sqlHousehold) => {
  if (!kvHousehold) return sqlHousehold;
  if (!sqlHousehold) return kvHousehold;
  return {
    ...kvHousehold,
    householdName: sqlHousehold.householdName || kvHousehold.householdName,
    childName: sqlHousehold.childName || kvHousehold.childName,
    inviteCode: sqlHousehold.inviteCode || kvHousehold.inviteCode,
    members: sqlHousehold.members?.length ? sqlHousehold.members : kvHousehold.members,
  };
};

export const findHouseholdByIdFromSql = async (householdId) => {
  if (!householdId) return null;

  const pool = await getPool();
  if (!pool) return null;

  try {
    const householdResult = await pool.query(
      `SELECT id, household_name, child_name, invite_code
       FROM households
       WHERE id = $1
       LIMIT 1`,
      [householdId]
    );
    if (householdResult.rows.length === 0) return null;

    const membersResult = await pool.query(
      `SELECT id, user_id, full_name, email, role, status
       FROM household_members
       WHERE household_id = $1
       ORDER BY created_at ASC`,
      [householdId]
    );

    return mapHouseholdRow(householdResult.rows[0], membersResult.rows);
  } finally {
    await pool.end();
  }
};
