import { describe, expect, it } from 'vitest';
import { evaluateGlucoseAlert } from '../../server/alert-engine.mjs';

const household = {
  safetyPreferences: { daySensitivity: 'balanced', nightSensitivity: 'protective' },
  dexcom: {
    status: 'connected',
    latestTimestamp: new Date().toISOString(),
    dataFreshness: 'live',
  },
};

describe('alert calibration', () => {
  const forceDayMode = () => {
    const original = Date.prototype.getHours;
    Date.prototype.getHours = () => 12;
    return () => {
      Date.prototype.getHours = original;
    };
  };

  it('watch threshold around 75 mg/dL', () => {
    const restore = forceDayMode();
    try {
      const result = evaluateGlucoseAlert({
        ...household,
        dexcom: { ...household.dexcom, latestGlucose: 74, latestTrend: 'flat' },
      });
      expect(result.shouldAlert).toBe(true);
      expect(result.level).toBe('watch');
    } finally {
      restore();
    }
  });

  it('risk threshold around 65 mg/dL', () => {
    const restore = forceDayMode();
    try {
      const result = evaluateGlucoseAlert({
        ...household,
        dexcom: { ...household.dexcom, latestGlucose: 64, latestTrend: 'flat' },
      });
      expect(result.shouldAlert).toBe(true);
      expect(result.level).toBe('risk');
    } finally {
      restore();
    }
  });

  it('critical threshold at 54 mg/dL', () => {
    const result = evaluateGlucoseAlert({
      ...household,
      dexcom: { ...household.dexcom, latestGlucose: 54, latestTrend: 'down' },
    });
    expect(result.shouldAlert).toBe(true);
    expect(result.level).toBe('critical');
  });

  it('high glucose watch threshold', () => {
    const result = evaluateGlucoseAlert({
      ...household,
      dexcom: { ...household.dexcom, latestGlucose: 245, latestTrend: 'up' },
    });
    expect(result.shouldAlert).toBe(true);
  });
});
