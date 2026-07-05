import { ensureDexcomConnection } from '../../dexcom-service.mjs';
import { operatingMode } from '../../state-machine.mjs';
import {
  ALERT_COOLDOWN_MS,
  ALERT_RULE_VERSION,
  STALE_READING_MAX_AGE_MINUTES,
  resolveThresholds,
} from './alert-rules.mjs';
import { buildDecisionRecord, toAlertDecision } from './alert-types.mjs';
import { readingAgeMinutes, isStaleReading } from '../glucose/reading-freshness.mjs';

export { ALERT_RULE_VERSION };

const normalizeTrend = (value) => {
  const trend = String(value || '').toLowerCase();
  if (trend.includes('down')) return 'down';
  if (trend.includes('up')) return 'up';
  if (trend.includes('flat')) return 'flat';
  return 'unknown';
};

export const evaluateGlucoseAlert = (household, options = {}) => {
  const mode = options.mode || operatingMode();
  const dexcom = ensureDexcomConnection(household);
  const glucose = dexcom.latestGlucose;
  const trend = normalizeTrend(dexcom.latestTrend);
  const freshness = dexcom.dataFreshness || 'offline';
  const ageMinutes = readingAgeMinutes(dexcom);

  const base = {
    ruleVersion: ALERT_RULE_VERSION,
    inputGlucose: glucose,
    inputTrend: trend,
    inputFreshness: freshness,
    shouldAlert: false,
    level: 'ok',
    reason: 'stable',
    detail: '',
  };

  if (dexcom.status !== 'connected' || !Number.isFinite(glucose)) {
    return {
      ...base,
      shouldAlert: false,
      level: 'watch',
      reason: 'no_data',
      detail: 'Waiting for a connected Dexcom reading before alert logic runs.',
    };
  }

  if (options.shadowMode) {
    base.shadowMode = true;
  }

  const lastAlertAt = household?.safetyState?.lastAlertAt;
  if (lastAlertAt && Date.now() - Date.parse(lastAlertAt) < ALERT_COOLDOWN_MS && !options.ignoreCooldown) {
    return {
      ...base,
      shouldAlert: false,
      level: 'watch',
      reason: 'cooldown_suppressed',
      detail: 'Recent alert is in cooldown. Monitoring continues.',
    };
  }

  if (isStaleReading(dexcom, STALE_READING_MAX_AGE_MINUTES)) {
    return {
      ...base,
      shouldAlert: true,
      level: 'watch',
      reason: 'stale_data',
      detail: 'Sensor data is stale or offline. Confirm the connection before acting on glucose values.',
    };
  }

  const thresholds = resolveThresholds(household, mode);
  const adjustedThresholds = household?.diabetesType === 'type2'
    ? {
        ...thresholds,
        watchHigh: Math.max(thresholds.watchHigh - 20, 180),
        riskHigh: Math.max(thresholds.riskHigh - 20, 240),
      }
    : thresholds;
  const rapidFall = trend === 'down' && glucose <= adjustedThresholds.watchLow;

  if (glucose <= adjustedThresholds.criticalLow || (rapidFall && glucose <= adjustedThresholds.riskLow)) {
    return {
      ...base,
      shouldAlert: true,
      level: 'critical',
      reason: glucose <= thresholds.criticalLow ? 'critical_low' : 'rapid_fall',
      detail: `Glucose ${glucose} mg/dL with ${trend} trend crossed a critical threshold.`,
    };
  }

  if (glucose <= adjustedThresholds.riskLow) {
    return {
      ...base,
      shouldAlert: true,
      level: 'risk',
      reason: 'low_glucose',
      detail: `Glucose ${glucose} mg/dL is below the risk threshold.`,
    };
  }

  if (glucose <= adjustedThresholds.watchLow || rapidFall) {
    return {
      ...base,
      shouldAlert: true,
      level: 'watch',
      reason: rapidFall ? 'falling_trend' : 'watch_low',
      detail: rapidFall
        ? `Glucose ${glucose} mg/dL is falling and needs a quick check.`
        : `Glucose ${glucose} mg/dL is below the watch threshold.`,
    };
  }

  if (glucose >= adjustedThresholds.riskHigh) {
    return {
      ...base,
      shouldAlert: true,
      level: 'risk',
      reason: 'high_glucose',
      detail: `Glucose ${glucose} mg/dL is above the high-risk threshold.`,
    };
  }

  if (glucose >= adjustedThresholds.watchHigh) {
    return {
      ...base,
      shouldAlert: true,
      level: 'watch',
      reason: 'high_glucose',
      detail: `Glucose ${glucose} mg/dL is above the watch threshold.`,
    };
  }

  return {
    ...base,
    shouldAlert: false,
    level: 'ok',
    reason: 'stable',
    detail: `Glucose ${glucose} mg/dL is within the current monitoring range.`,
  };
};

export const evaluateAlertDecision = (household, options = {}) => {
  const mode = options.mode || operatingMode();
  const evaluation = evaluateGlucoseAlert(household, options);
  let thresholds = resolveThresholds(household, mode);
  if (household?.diabetesType === 'type2') {
    thresholds = {
      ...thresholds,
      watchHigh: Math.max(thresholds.watchHigh - 20, 180),
      riskHigh: Math.max(thresholds.riskHigh - 20, 240),
    };
  }
  const decision = buildDecisionRecord({
    evaluation,
    household,
    thresholds,
    previousState: household?.safetyState || {},
    readingAgeMinutes: readingAgeMinutes(ensureDexcomConnection(household)),
    mode,
  });
  return { evaluation, decision, alertDecision: toAlertDecision(evaluation) };
};
