import { describe, expect, it } from 'vitest';
import { applyAlertEvaluation, evaluateGlucoseAlert } from '../../server/alert-engine.mjs';

const baseHousehold = {
  childName: 'Mila',
  primaryParent: 'Anna',
  caregiverName: 'Jordan',
  safetyPreferences: {
    daySensitivity: 'balanced',
    nightSensitivity: 'protective',
    caregiverDelaySeconds: 60,
    dayPrimaryContact: 'parent',
    nightPrimaryContact: 'parent',
  },
  safetyState: {
    stage: 'monitoring',
    alertsCount: 0,
    escalationCount: 0,
    responders: ['Anna'],
    eventLog: [],
    sessions: [],
  },
  dexcom: {
    status: 'connected',
    latestGlucose: 110,
    latestTrend: 'flat',
    latestTimestamp: new Date().toISOString(),
    dataFreshness: 'live',
  },
};

describe('alert-engine', () => {
  it('returns stable when glucose is in range', () => {
    const result = evaluateGlucoseAlert(baseHousehold);
    expect(result.shouldAlert).toBe(false);
    expect(result.reason).toBe('stable');
  });

  it('flags critical low glucose', () => {
    const result = evaluateGlucoseAlert({
      ...baseHousehold,
      dexcom: { ...baseHousehold.dexcom, latestGlucose: 52, latestTrend: 'down' },
    });
    expect(result.shouldAlert).toBe(true);
    expect(result.level).toBe('critical');
  });

  it('flags stale data as watch alert', () => {
    const result = evaluateGlucoseAlert({
      ...baseHousehold,
      dexcom: {
        ...baseHousehold.dexcom,
        dataFreshness: 'offline',
        latestTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    });
    expect(result.shouldAlert).toBe(true);
    expect(result.reason).toBe('stale_data');
  });

  it('escalates monitoring household into parent_alerted', () => {
    const { household } = applyAlertEvaluation({
      ...baseHousehold,
      dexcom: { ...baseHousehold.dexcom, latestGlucose: 58, latestTrend: 'down' },
    });
    expect(household.safetyState.stage).toBe('parent_alerted');
    expect(household.safetyState.alertsCount).toBe(1);
  });

  it('alerts earlier on high glucose for type2 households', () => {
    const type1 = evaluateGlucoseAlert({
      ...baseHousehold,
      dexcom: { ...baseHousehold.dexcom, latestGlucose: 235, latestTrend: 'up' },
    });
    const type2 = evaluateGlucoseAlert({
      ...baseHousehold,
      diabetesType: 'type2',
      dexcom: { ...baseHousehold.dexcom, latestGlucose: 235, latestTrend: 'up' },
    });

    expect(type1.shouldAlert).toBe(false);
    expect(type2.shouldAlert).toBe(true);
    expect(type2.reason).toBe('high_glucose');
  });
});
