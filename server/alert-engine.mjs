import { randomBytes } from 'node:crypto';
import { ensureDexcomConnection } from './dexcom-service.mjs';
import { ensureSafetyState, operatingMode, preferredPrimaryContact } from './state-machine.mjs';
import { ALERT_RULE_VERSION } from './domain/alerts/alert-rules.mjs';
import { evaluateGlucoseAlert, evaluateAlertDecision } from './domain/alerts/alert-engine.mjs';

export { ALERT_RULE_VERSION, evaluateGlucoseAlert, evaluateAlertDecision };

const buildAlertEvent = (household, evaluation) => {
  const primaryContact = preferredPrimaryContact(household, operatingMode());
  return {
    id: randomBytes(8).toString('hex'),
    kind: 'alert',
    step: evaluation.level === 'critical' ? 'Critical signal detected' : 'Risk detected',
    actor: 'T1D system',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    detail: evaluation.detail,
    status: 'active',
    primaryContact,
    ruleVersion: ALERT_RULE_VERSION,
    level: evaluation.level,
    reason: evaluation.reason,
  };
};

export const applyAlertEvaluation = (household) => {
  const safetyState = ensureSafetyState(household);
  const { evaluation, decision } = evaluateAlertDecision(household);
  const activeStages = new Set(['parent_alerted', 'parent_handling', 'caregiver_escalated', 'caregiver_active']);

  if (activeStages.has(safetyState.stage)) {
    return { household, evaluation, decision };
  }

  if (evaluation.shouldAlert && (safetyState.stage === 'monitoring' || safetyState.stage === 'recovery_watch')) {
    const primaryContact = preferredPrimaryContact(household, operatingMode());
    const alertEvent = buildAlertEvent(household, evaluation);
    const nextSafetyState = {
      ...safetyState,
      stage: 'parent_alerted',
      responder: primaryContact.name,
      acknowledgedAt: `Awaiting ${primaryContact.label.toLowerCase()} confirmation`,
      alertsCount: (safetyState.alertsCount || 0) + 1,
      responders: Array.from(new Set([primaryContact.name, ...(safetyState.responders || [])])),
      eventLog: [
        ...(Array.isArray(safetyState.eventLog) ? safetyState.eventLog : []),
        alertEvent,
        {
          id: randomBytes(8).toString('hex'),
          kind: 'notification',
          step: `${primaryContact.label} notified`,
          actor: primaryContact.name,
          time: alertEvent.time,
          detail: `${primaryContact.label} received the first alert and opened the case.`,
          status: 'active',
        },
      ],
      lastAlertReason: evaluation.reason,
      lastAlertLevel: evaluation.level,
      lastAlertAt: new Date().toISOString(),
      lastDecision: decision,
      responderOwnership: {
        state: 'notified',
        primaryRole: primaryContact.role,
        primaryName: primaryContact.name,
        alertId: alertEvent.id,
      },
    };

    return {
      household: {
        ...household,
        safetyState: nextSafetyState,
        updatedAt: new Date().toISOString(),
      },
      evaluation,
      decision,
    };
  }

  if (!evaluation.shouldAlert && safetyState.stage === 'recovery_watch') {
    return {
      household: {
        ...household,
        safetyState: {
          ...safetyState,
          stage: 'monitoring',
          acknowledgedAt: 'Monitoring is active',
          responderOwnership: { state: 'no_responder' },
        },
        updatedAt: new Date().toISOString(),
      },
      evaluation,
      decision,
    };
  }

  return { household, evaluation, decision };
};
