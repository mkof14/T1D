/** Alert rule set version — bump when threshold logic changes. */
export const ALERT_RULE_VERSION = '1.0.0';

export const ALERT_DECISIONS = Object.freeze([
  'no_action',
  'observe',
  'notify',
  'urgent_notify',
  'escalate',
  'resolve',
  'stale_data_warning',
]);

export const THRESHOLDS = Object.freeze({
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
});

export const ALERT_COOLDOWN_MS = 5 * 60 * 1000;
export const STALE_READING_MAX_AGE_MINUTES = 45;

export const resolveThresholds = (household, mode = 'day') => {
  const preferences = household?.safetyPreferences || {};
  let thresholds;
  if (mode === 'night') {
    const key = preferences.nightSensitivity || 'protective';
    thresholds = THRESHOLDS.night[key] || THRESHOLDS.night.protective;
  } else {
    const key = preferences.daySensitivity || 'balanced';
    thresholds = THRESHOLDS.day[key] || THRESHOLDS.day.balanced;
  }
  return { ...thresholds };
};
