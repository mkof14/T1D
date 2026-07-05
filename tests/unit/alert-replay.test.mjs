import { describe, expect, it } from 'vitest';
import { runSimulationScenario, listSimulationScenarios } from '../../server/domain/alerts/alert-replay.mjs';
import { ALERT_RULE_VERSION } from '../../server/domain/alerts/alert-rules.mjs';

const baseHousehold = {
  id: 'hh-1',
  diabetesType: 'type1',
  safetyPreferences: { daySensitivity: 'balanced', nightSensitivity: 'protective' },
  safetyState: { stage: 'monitoring', eventLog: [] },
  dexcom: {
    status: 'connected',
    latestGlucose: 110,
    latestTrend: 'flat',
    latestTimestamp: new Date().toISOString(),
    dataFreshness: 'live',
    readings: [],
  },
};

describe('alert replay', () => {
  it('lists simulation scenarios with rule version', () => {
    const scenarios = listSimulationScenarios();
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios[0].ruleVersion).toBe(ALERT_RULE_VERSION);
  });

  it('runs rapid overnight fall scenario', () => {
    const result = runSimulationScenario(baseHousehold, '001_rapid_overnight_fall');
    expect(result.evaluation.shouldAlert).toBe(true);
    expect(result.decision.ruleVersion).toBe(ALERT_RULE_VERSION);
    expect(['notify', 'urgent_notify', 'observe']).toContain(result.alertDecision);
  });

  it('runs stale CGM scenario', () => {
    const result = runSimulationScenario(baseHousehold, '002_stale_cgm');
    expect(result.evaluation.reason).toBe('stale_data');
    expect(result.alertDecision).toBe('stale_data_warning');
  });
});
