import { getPool } from '../db.mjs';

const insertSql = `
  INSERT INTO glucose_readings (id, household_id, patient_id, source, recorded_at, glucose_mg_dl, trend)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (id) DO NOTHING
`;

/**
 * Phase B dual-write skeleton: persist immutable readings to Postgres when available.
 * KV/household JSON remains the source of truth until Phase D.
 */
export const insertGlucoseReading = async ({
  id,
  householdId,
  patientId = null,
  source = 'dexcom',
  recordedAt,
  glucoseMgDl,
  trend = 'unknown',
}) => {
  if (!id || !householdId || !recordedAt || glucoseMgDl == null) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await pool.query(insertSql, [
      id,
      householdId,
      patientId,
      source,
      recordedAt,
      glucoseMgDl,
      trend,
    ]);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'insert_failed' };
  } finally {
    await pool.end();
  }
};

export const insertGlucoseReadings = async (readings = []) => {
  const results = [];
  for (const reading of readings) {
    results.push(await insertGlucoseReading(reading));
  }
  return results;
};
