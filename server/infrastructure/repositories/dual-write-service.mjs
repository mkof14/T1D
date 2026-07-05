import { getPool } from '../db.mjs';
import { normalizeReading } from '../../domain/glucose/glucose-normalizer.mjs';
import { ensureHouseholdRow } from './household-repository.mjs';
import { insertGlucoseReadingWithPool } from './glucose-reading-repository.mjs';

const newReadingsSince = (previousReadings = [], nextReadings = []) => {
  const previousIds = new Set(
    (Array.isArray(previousReadings) ? previousReadings : [])
      .map((reading) => String(reading?.id || ''))
      .filter(Boolean)
  );

  return (Array.isArray(nextReadings) ? nextReadings : []).filter((reading) => {
    const id = String(reading?.id || '');
    return id ? !previousIds.has(id) : true;
  });
};

/**
 * Best-effort dual-write after Dexcom poll. KV JSON remains source of truth.
 */
export const dualWritePollReadings = async (household, previousReadings = [], nextReadings = []) => {
  const freshReadings = newReadingsSince(previousReadings, nextReadings);
  if (!household?.id || freshReadings.length === 0) {
    return { ok: true, skipped: true, reason: 'nothing_to_write', inserted: 0 };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set', inserted: 0 };
  }

  try {
    await ensureHouseholdRow(pool, household);

    let inserted = 0;
    for (const reading of freshReadings) {
      const normalized = normalizeReading(reading);
      if (!normalized) continue;
      const result = await insertGlucoseReadingWithPool(pool, {
        id: normalized.id,
        householdId: household.id,
        patientId: null,
        source: normalized.source,
        recordedAt: normalized.timestamp,
        glucoseMgDl: normalized.glucoseMgDl,
        trend: normalized.trend,
      });
      if (result.inserted) inserted += 1;
    }

    return { ok: true, skipped: false, inserted };
  } catch (error) {
    return { ok: false, skipped: false, inserted: 0, error: error?.message || 'dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteHouseholdReadings = async (household) => {
  const readings = household?.dexcom?.readings || [];
  return dualWritePollReadings(household, [], readings);
};
