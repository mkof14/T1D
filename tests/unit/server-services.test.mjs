import { describe, expect, it } from 'vitest';
import { createHouseholdStorage } from '../../server/services/household-storage.mjs';
import { createDexcomPollService } from '../../server/services/dexcom-poll-service.mjs';

describe('household-storage factory', () => {
  it('persists a new household record and mirrors to SQL hook', async () => {
    const writes = [];
    const mirrors = [];
    const storage = createHouseholdStorage({
      readJson: async () => ({ households: [] }),
      writeJson: async (_file, value) => {
        writes.push(value);
      },
      HOUSEHOLDS_FILE: '/tmp/households.json',
      ensureSafetyState: (household) => household.safetyState || { stage: 'monitoring' },
      normalizeDiabetesType: (value) => value || 'type1',
      sealDexcomTokens: (dexcom) => dexcom,
      ensureDexcomConnection: ({ dexcom }) => dexcom || { status: 'disconnected' },
      dualWriteDexcomConnection: async (household) => {
        mirrors.push(household.id);
        return { ok: true, skipped: false };
      },
    });

    const households = [];
    await storage.persistHouseholdRecord(households, {
      id: 'hh-1',
      householdName: 'Circle',
      diabetesType: 'type1',
      safetyState: { stage: 'monitoring' },
    });

    expect(households).toHaveLength(1);
    expect(writes).toHaveLength(1);
    expect(mirrors).toEqual(['hh-1']);
  });
});

describe('dexcom-poll-service factory', () => {
  it('exports poll helpers', () => {
    const service = createDexcomPollService({
      randomBytes: () => Buffer.from('abc'),
      ensureDexcomOps: (household) => household.dexcomOps || { auditTrail: [], consecutiveFailures: 0 },
      ensureDexcomConnection: () => ({ status: 'disconnected', readings: [] }),
      dexcomEnvConfig: () => ({ useLiveMode: false }),
      pollDexcom: () => ({ status: 'connected', readings: [], message: 'ok' }),
      pollDexcomLive: async () => ({ status: 'connected', readings: [], message: 'ok' }),
      applyAlertEvaluation: (household) => ({ household, alertCreated: null, decision: {} }),
      dualWritePollReadings: async () => ({ ok: true, skipped: true }),
      dualWriteDexcomConnection: async () => ({ ok: true, skipped: true }),
      dualWriteAlertCreated: async () => ({ ok: true, skipped: true }),
      t: (_lang, key) => key,
      readHouseholds: async () => [],
      writeHouseholds: async () => {},
    });

    expect(typeof service.applyDexcomPollToHousehold).toBe('function');
    expect(typeof service.runBackgroundDexcomSync).toBe('function');
    expect(service.shouldRunBackgroundDexcomPoll({ dexcom: { status: 'disconnected' } })).toBe(false);
  });
});
