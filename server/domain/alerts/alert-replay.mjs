import { evaluateAlertDecision } from './alert-engine.mjs';
import { ALERT_RULE_VERSION } from './alert-rules.mjs';

/** Replay alert evaluation for simulation / regression without mutating household. */
export const replayAlertEvaluation = (householdSnapshot, options = {}) =>
  evaluateAlertDecision(householdSnapshot, {
    ...options,
    shadowMode: options.shadowMode ?? true,
    ignoreCooldown: options.ignoreCooldown ?? true,
  });

export const SIMULATION_SCENARIOS = Object.freeze({
  '001_rapid_overnight_fall': {
    label: 'Rapid overnight fall',
    patch: (household) => ({
      ...household,
      safetyPreferences: { ...household.safetyPreferences, nightSensitivity: 'protective' },
      dexcom: {
        ...household.dexcom,
        status: 'connected',
        latestGlucose: 62,
        latestTrend: 'down',
        latestTimestamp: new Date().toISOString(),
        dataFreshness: 'live',
      },
    }),
    mode: 'night',
  },
  '002_stale_cgm': {
    label: 'Stale CGM data',
    patch: (household) => ({
      ...household,
      dexcom: {
        ...household.dexcom,
        status: 'connected',
        latestGlucose: 95,
        latestTrend: 'flat',
        latestTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        dataFreshness: 'offline',
      },
    }),
  },
  '003_duplicate_reading': {
    label: 'Duplicate reading',
    patch: (household) => household,
    duplicateReading: true,
  },
});

export const runSimulationScenario = (household, scenarioId, options = {}) => {
  const scenario = SIMULATION_SCENARIOS[scenarioId];
  if (!scenario) {
    throw new Error(`Unknown simulation scenario: ${scenarioId}`);
  }
  const snapshot = scenario.patch(JSON.parse(JSON.stringify(household)));
  return replayAlertEvaluation(snapshot, { mode: scenario.mode, ...options });
};

export const listSimulationScenarios = () =>
  Object.entries(SIMULATION_SCENARIOS).map(([id, scenario]) => ({
    id,
    label: scenario.label,
    ruleVersion: ALERT_RULE_VERSION,
  }));
