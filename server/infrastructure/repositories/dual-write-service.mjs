import { getPool } from '../db.mjs';
import { normalizeReading } from '../../domain/glucose/glucose-normalizer.mjs';
import { ensureHouseholdRow } from './household-repository.mjs';
import { syncDexcomConnectionRows } from './device-connection-repository.mjs';
import {
  insertAcknowledgementRow,
  insertAlertTransitionRow,
  resolveAlertRow,
  upsertAlertRow,
} from './alert-repository.mjs';
import { insertAuditEventRow } from './audit-repository.mjs';
import { randomBytes } from 'node:crypto';
import { insertGlucoseReadingWithPool } from './glucose-reading-repository.mjs';
import { upsertUserRow } from './user-repository.mjs';
import {
  revokeSessionRow,
  revokeSessionsForUserRows,
  upsertSessionRow,
} from './session-repository.mjs';

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

    await syncDexcomConnectionRows(pool, household);

    return { ok: true, skipped: false, inserted };
  } catch (error) {
    return { ok: false, skipped: false, inserted: 0, error: error?.message || 'dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteHouseholdSnapshot = async (household) => {
  if (!household?.id) {
    return { ok: true, skipped: true, reason: 'missing_household' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await ensureHouseholdRow(pool, household);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'household_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteDexcomConnection = async (household) => {
  if (!household?.id) {
    return { ok: true, skipped: true, reason: 'missing_household' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await ensureHouseholdRow(pool, household);
    await syncDexcomConnectionRows(pool, household);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'dexcom_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteHouseholdReadings = async (household) => {
  const readings = household?.dexcom?.readings || [];
  return dualWritePollReadings(household, [], readings);
};

export const dualWriteUser = async (user) => {
  if (!user?.id) {
    return { ok: true, skipped: true, reason: 'missing_user' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    if (user.householdId) {
      await ensureHouseholdRow(pool, { id: user.householdId, householdName: 'Household', inviteCode: 'UNKNOWN' });
    }
    await upsertUserRow(pool, user);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'user_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteUsers = async (users = []) => {
  const results = [];
  for (const user of users) {
    results.push(await dualWriteUser(user));
  }
  return results;
};

export const dualWriteSession = async (session) => {
  if (!session?.id || !session?.userId) {
    return { ok: true, skipped: true, reason: 'missing_session' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await upsertSessionRow(pool, session);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'session_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteRevokeSession = async (sessionId) => {
  if (!sessionId) {
    return { ok: true, skipped: true, reason: 'missing_session' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await revokeSessionRow(pool, sessionId);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'session_revoke_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteRevokeSessionsForUser = async (userId) => {
  if (!userId) {
    return { ok: true, skipped: true, reason: 'missing_user' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await revokeSessionsForUserRows(pool, userId);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'session_revoke_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteAlertCreated = async (household, alertEvent, decision = {}) => {
  if (!household?.id || !alertEvent?.id) {
    return { ok: true, skipped: true, reason: 'missing_alert' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    await ensureHouseholdRow(pool, household);
    await upsertAlertRow(pool, {
      id: alertEvent.id,
      householdId: household.id,
      ruleVersion: alertEvent.ruleVersion,
      level: alertEvent.level,
      reason: alertEvent.reason,
      decision: decision?.decision || 'notify',
      status: 'active',
      inputSnapshot: decision?.inputs || decision || {},
    });
    await insertAlertTransitionRow(pool, {
      id: randomBytes(8).toString('hex'),
      alertId: alertEvent.id,
      fromStatus: 'monitoring',
      toStatus: 'notified',
      reasonCode: 'alert_created',
    });
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'alert_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteAlertResponderAction = async ({ household, user, action, alertId }) => {
  if (!household?.id || !user?.id || !alertId) {
    return { ok: true, skipped: true, reason: 'missing_fields' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    const transitionId = randomBytes(8).toString('hex');
    if (action === 'acknowledge') {
      await insertAcknowledgementRow(pool, {
        id: `ack-${randomBytes(6).toString('hex')}`,
        alertId,
        userId: user.id,
      });
      await insertAlertTransitionRow(pool, {
        id: transitionId,
        alertId,
        fromStatus: 'notified',
        toStatus: 'acknowledged',
        actorUserId: user.id,
        reasonCode: action,
      });
    } else if (action === 'take-ownership') {
      await insertAlertTransitionRow(pool, {
        id: transitionId,
        alertId,
        fromStatus: 'acknowledged',
        toStatus: 'active_responder',
        actorUserId: user.id,
        reasonCode: action,
      });
    } else if (action === 'resolve') {
      await resolveAlertRow(pool, alertId);
      await insertAlertTransitionRow(pool, {
        id: transitionId,
        alertId,
        fromStatus: 'active_responder',
        toStatus: 'resolved',
        actorUserId: user.id,
        reasonCode: action,
      });
    }

    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'alert_action_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

export const dualWriteAuditEvent = async (event) => {
  if (!event?.id) {
    return { ok: true, skipped: true, reason: 'missing_event' };
  }

  const pool = await getPool();
  if (!pool) {
    return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };
  }

  try {
    if (event.householdId) {
      await ensureHouseholdRow(pool, { id: event.householdId, householdName: 'Household', inviteCode: 'UNKNOWN' });
    }
    await insertAuditEventRow(pool, event);
    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'audit_dual_write_failed' };
  } finally {
    await pool.end();
  }
};
