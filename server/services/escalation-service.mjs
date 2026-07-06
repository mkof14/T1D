import { randomBytes } from 'node:crypto';
import {
  buildEscalationTarget,
  ESCALATION_DEFAULTS,
  shouldEscalate,
} from '../domain/safety/escalation-policy.mjs';
import { getActiveAlert } from '../domain/safety/responder-ownership.mjs';
import { operatingMode } from '../state-machine.mjs';
import { orchestrateEscalation } from './notification-orchestrator.mjs';
import { dualWriteEscalation } from '../infrastructure/repositories/dual-write-service.mjs';

const nowLabel = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

export const applyEscalationIfNeeded = (household) => {
  const safetyState = household?.safetyState || {};
  if (safetyState.stage !== 'parent_alerted') {
    return { escalated: false, household };
  }

  const ownership = safetyState.responderOwnership || {};
  if (ownership.state !== 'notified') {
    return { escalated: false, household };
  }

  const preferences = household?.safetyPreferences || {};
  const timeoutSeconds = preferences.caregiverDelaySeconds || ESCALATION_DEFAULTS.acknowledgementTimeoutSeconds;
  if (!shouldEscalate(safetyState, { acknowledgementTimeoutSeconds: timeoutSeconds })) {
    return { escalated: false, household };
  }

  const escalationCount = Number(safetyState.escalationCount || 0);
  if (escalationCount >= ESCALATION_DEFAULTS.maxEscalations) {
    return { escalated: false, household };
  }

  const active = getActiveAlert(safetyState);
  const alertId = ownership.alertId || active?.id;
  if (!alertId) {
    return { escalated: false, household };
  }

  const mode = operatingMode();
  const fromRole = ownership.primaryRole || 'parent';
  const target = buildEscalationTarget(household, mode);
  const escalationId = randomBytes(8).toString('hex');

  const escalationEvent = {
    id: escalationId,
    kind: 'escalation',
    step: 'Escalated to backup',
    actor: target.name,
    time: nowLabel(),
    detail: `No acknowledgement within ${timeoutSeconds}s. Backup ${target.name} was notified.`,
    status: 'active',
    alertId,
    fromRole,
    toRole: target.role,
  };

  const nextSafetyState = {
    ...safetyState,
    stage: 'caregiver_escalated',
    responder: target.name,
    acknowledgedAt: `Awaiting ${target.name}`,
    escalationCount: escalationCount + 1,
    responderOwnership: {
      state: 'escalated',
      primaryRole: fromRole,
      primaryName: ownership.primaryName,
      escalatedToRole: target.role,
      escalatedToName: target.name,
      alertId,
      escalatedAt: new Date().toISOString(),
      notifiedAt: ownership.notifiedAt,
    },
    eventLog: [...(Array.isArray(safetyState.eventLog) ? safetyState.eventLog : []), escalationEvent],
  };

  void orchestrateEscalation({
    householdId: household.id,
    alertId,
    fromRole,
    target,
    payload: { escalationId, timeoutSeconds },
  });

  void dualWriteEscalation({
    id: escalationId,
    alertId,
    householdId: household.id,
    fromRole,
    toRole: target.role,
    reason: `timeout_${timeoutSeconds}s`,
  }).then((result) => {
    if (!result.ok && !result.skipped) {
      console.warn('[t1d-api] escalation dual-write failed', result.error);
    }
  });

  return {
    escalated: true,
    household: {
      ...household,
      safetyState: nextSafetyState,
      updatedAt: new Date().toISOString(),
    },
  };
};

export const runEscalationPass = async (readHouseholds, writeHouseholds) => {
  const households = await readHouseholds();
  let escalated = 0;
  const nextHouseholds = households.map((household) => {
    const result = applyEscalationIfNeeded(household);
    if (result.escalated) escalated += 1;
    return result.household;
  });

  if (escalated > 0) {
    await writeHouseholds(nextHouseholds);
  }

  return { processed: households.length, escalated };
};
