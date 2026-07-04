import { describe, expect, it } from 'vitest';
import { connectDexcom, defaultDexcomConnection, pollDexcom } from '../../server/dexcom-service.mjs';

const household = {
  primaryParent: 'Anna',
  householdName: 'Mila Support Circle',
};

describe('dexcom-service', () => {
  it('returns disconnected default connection', () => {
    const connection = defaultDexcomConnection();
    expect(connection.status).toBe('disconnected');
  });

  it('mock connect seeds readings', () => {
    const connection = connectDexcom(household, 'Anna');
    expect(connection.status).toBe('connected');
    expect(Array.isArray(connection.readings)).toBe(true);
    expect(connection.readings.length).toBeGreaterThan(0);
  });

  it('mock poll advances glucose readings', () => {
    const connected = connectDexcom(household, 'Anna');
    const polled = pollDexcom({ ...household, dexcom: connected });
    expect(polled.pollCount).toBeGreaterThan(connected.pollCount || 0);
    expect(polled.latestGlucose).not.toBeNull();
  });
});
