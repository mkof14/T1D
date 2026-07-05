export const ALERT_LEVELS = Object.freeze(['ok', 'watch', 'risk', 'critical']);

export const ALERT_REASONS = Object.freeze([
  'no_data',
  'stale_data',
  'critical_low',
  'rapid_fall',
  'low_glucose',
  'watch_low',
  'high_glucose',
  'stable',
  'cooldown_suppressed',
  'duplicate_suppressed',
]);

/** Maps evaluation level + reason to orchestrator decision. */
export const toAlertDecision = (evaluation) => {
  if (!evaluation?.shouldAlert) return 'no_action';
  if (evaluation.reason === 'stale_data') return 'stale_data_warning';
  if (evaluation.level === 'critical') return 'urgent_notify';
  if (evaluation.level === 'risk') return 'notify';
  if (evaluation.level === 'watch') return 'observe';
  return 'no_action';
};

export const buildDecisionRecord = ({
  evaluation,
  household,
  thresholds,
  previousState = {},
  readingAgeMinutes = null,
  mode = 'day',
}) => ({
  ruleVersion: evaluation.ruleVersion,
  decision: toAlertDecision(evaluation),
  level: evaluation.level,
  reason: evaluation.reason,
  detail: evaluation.detail,
  thresholdsUsed: thresholds,
  readingAgeMinutes,
  mode,
  patientProfile: {
    householdId: household?.id || '',
    diabetesType: household?.diabetesType || 'type1',
    daySensitivity: household?.safetyPreferences?.daySensitivity || 'balanced',
    nightSensitivity: household?.safetyPreferences?.nightSensitivity || 'protective',
  },
  previousAlertState: {
    stage: previousState.stage || 'monitoring',
    lastAlertLevel: previousState.lastAlertLevel || null,
    lastAlertReason: previousState.lastAlertReason || null,
  },
  inputReadings: {
    glucose: evaluation.inputGlucose ?? null,
    trend: evaluation.inputTrend ?? 'unknown',
    freshness: evaluation.inputFreshness ?? 'offline',
  },
  timestamp: new Date().toISOString(),
});
