import { randomBytes } from 'node:crypto';
import { ensureDexcomConnection } from './dexcom-service.mjs';
import { ensureSafetyState, operatingMode, preferredPrimaryContact } from './state-machine.mjs';

const THRESHOLDS = {
  day: {
    gentle: { watchLow: 80, riskLow: 70, criticalLow: 55, watchHigh: 250, riskHigh: 300 },
    balanced: { watchLow: 75, riskLow: 65, criticalLow: 54, watchHigh: 240, riskHigh: 300 },
    watchful: { watchLow: 85, riskLow: 75, criticalLow: 60, watchHigh: 220, riskHigh: 280 },
  },
  night: {
    balanced: { watchLow: 80, riskLow: 70, criticalLow: 55, watchHigh: 250, riskHigh: 300 },
    protective: { watchLow: 85, riskLow: 75, criticalLow: 60, watchHigh: 240, riskHigh: 290 },
    urgent: { watchLow: 90, riskLow: 80, criticalLow: 65, watchHigh: 220, riskHigh: 280 },
  },
};

const resolveThresholds = (household) => {
  const mode = operatingMode();
  const preferences = household?.safetyPreferences || {};
  let thresholds;
  if (mode === 'night') {
    const key = preferences.nightSensitivity || 'protective';
    thresholds = THRESHOLDS.night[key] || THRESHOLDS.night.protective;
  } else {
    const key = preferences.daySensitivity || 'balanced';
    thresholds = THRESHOLDS.day[key] || THRESHOLDS.day.balanced;
  }

  if (household?.diabetesType === 'type2') {
    return {
      ...thresholds,
      watchHigh: Math.max(thresholds.watchHigh - 20, 180),
      riskHigh: Math.max(thresholds.riskHigh - 20, 240),
    };
  }

  return thresholds;
};

const glucoseAgeMinutes = (dexcom) => {
  if (!dexcom.latestTimestamp) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.round((Date.now() - Date.parse(dexcom.latestTimestamp)) / 60000));
};

export const evaluateGlucoseAlert = (household) => {
  const dexcom = ensureDexcomConnection(household);
  const glucose = dexcom.latestGlucose;
  const trend = dexcom.latestTrend || 'unknown';
  const freshness = dexcom.dataFreshness || 'offline';
  const ageMinutes = glucoseAgeMinutes(dexcom);

  if (dexcom.status !== 'connected' || !Number.isFinite(glucose)) {
    return {
      shouldAlert: false,
      level: 'watch',
      reason: 'no_data',
      detail: 'Waiting for a connected Dexcom reading before alert logic runs.',
    };
  }

  if (freshness === 'offline' || ageMinutes > 45) {
    return {
      shouldAlert: true,
      level: 'watch',
      reason: 'stale_data',
      detail: 'Sensor data is stale or offline. The household should confirm the connection.',
    };
  }

  const thresholds = resolveThresholds(household);
  const rapidFall = trend === 'down' && glucose <= thresholds.watchLow;

  if (glucose <= thresholds.criticalLow || (rapidFall && glucose <= thresholds.riskLow)) {
    return {
      shouldAlert: true,
      level: 'critical',
      reason: glucose <= thresholds.criticalLow ? 'critical_low' : 'rapid_fall',
      detail: `Glucose ${glucose} mg/dL with ${trend} trend crossed a critical threshold.`,
    };
  }

  if (glucose <= thresholds.riskLow) {
    return {
      shouldAlert: true,
      level: 'risk',
      reason: 'low_glucose',
      detail: `Glucose ${glucose} mg/dL is below the risk threshold.`,
    };
  }

  if (glucose <= thresholds.watchLow || rapidFall) {
    return {
      shouldAlert: true,
      level: 'watch',
      reason: rapidFall ? 'falling_trend' : 'watch_low',
      detail: rapidFall
        ? `Glucose ${glucose} mg/dL is falling and needs a quick check.`
        : `Glucose ${glucose} mg/dL is below the watch threshold.`,
    };
  }

  if (glucose >= thresholds.riskHigh) {
    return {
      shouldAlert: true,
      level: 'risk',
      reason: 'high_glucose',
      detail: `Glucose ${glucose} mg/dL is above the high-risk threshold.`,
    };
  }

  if (glucose >= thresholds.watchHigh) {
    return {
      shouldAlert: true,
      level: 'watch',
      reason: 'high_glucose',
      detail: `Glucose ${glucose} mg/dL is above the watch threshold.`,
    };
  }

  return {
    shouldAlert: false,
    level: 'ok',
    reason: 'stable',
    detail: `Glucose ${glucose} mg/dL is within the current monitoring range.`,
  };
};

const buildAlertEvent = (household, evaluation) => {
  const primaryContact = preferredPrimaryContact(household, operatingMode());
  return {
    id: randomBytes(8).toString('hex'),
    step: evaluation.level === 'critical' ? 'Critical signal detected' : 'Risk detected',
    actor: 'T1D system',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    detail: evaluation.detail,
    status: 'active',
    primaryContact,
  };
};

export const applyAlertEvaluation = (household) => {
  const safetyState = ensureSafetyState(household);
  const evaluation = evaluateGlucoseAlert(household);
  const activeStages = new Set(['parent_alerted', 'parent_handling', 'caregiver_escalated', 'caregiver_active']);

  if (activeStages.has(safetyState.stage)) {
    return { household, evaluation };
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
          step: `${primaryContact.label} alerted`,
          actor: primaryContact.name,
          time: alertEvent.time,
          detail: `${primaryContact.label} received the first alert and opened the case.`,
          status: 'active',
        },
      ],
      lastAlertReason: evaluation.reason,
      lastAlertLevel: evaluation.level,
    };

    return {
      household: {
        ...household,
        safetyState: nextSafetyState,
        updatedAt: new Date().toISOString(),
      },
      evaluation,
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
        },
        updatedAt: new Date().toISOString(),
      },
      evaluation,
    };
  }

  return { household, evaluation };
};
