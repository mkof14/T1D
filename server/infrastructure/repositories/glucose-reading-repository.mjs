import { getPool } from '../db.mjs';

const insertSql = `
  INSERT INTO glucose_readings (id, household_id, patient_id, source, recorded_at, glucose_mg_dl, trend)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  ON CONFLICT (id) DO NOTHING
`;

export const insertGlucoseReadingWithPool = async (pool, {
  id,
  householdId,
  patientId = null,
  source = 'dexcom',
  recordedAt,
  glucoseMgDl,
  trend = 'unknown',
}) => {
  if (!pool || !id || !householdId || !recordedAt || glucoseMgDl == null) {
    return { ok: false, skipped: true, inserted: false, reason: 'missing_fields' };
  }

  const result = await pool.query(insertSql, [
    id,
    householdId,
    patientId,
    source,
    recordedAt,
    glucoseMgDl,
    trend,
  ]);

  return { ok: true, skipped: false, inserted: (result.rowCount || 0) > 0 };
};

/**
 * Phase B dual-write: persist immutable readings to Postgres when available.
 * KV/household JSON remains the source of truth until Phase D.
 */
export const insertGlucoseReading = async (payload) => {
  if (!payload?.id || !payload?.householdId || !payload?.recordedAt || payload.glucoseMgDl == null) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    const result = await insertGlucoseReadingWithPool(pool, payload);
    return { ok: result.ok, skipped: result.skipped, inserted: result.inserted };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'insert_failed' };
  } finally {
    await pool.end();
  }
};

export const insertGlucoseReadings = async (readings = []) => {
  const pool = await getPool();
  if (!pool) {
    return readings.map(() => ({ ok: false, skipped: true, reason: 'DATABASE_URL not set' }));
  }

  try {
    return Promise.all(readings.map((reading) => insertGlucoseReadingWithPool(pool, reading)));
  } catch (error) {
    return [{ ok: false, skipped: false, error: error?.message || 'insert_failed' }];
  } finally {
    await pool.end();
  }
};
