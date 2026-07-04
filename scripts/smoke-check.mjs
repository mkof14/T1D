import assert from 'node:assert/strict';
import { evaluateGlucoseAlert } from '../server/alert-engine.mjs';
import { createDefaultSafetyState, ensureSafetyState } from '../server/state-machine.mjs';

const household = {
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
  dexcom: {
    status: 'connected',
    latestGlucose: 62,
    latestTrend: 'down',
    latestTimestamp: new Date().toISOString(),
    dataFreshness: 'live',
  },
};

const alert = evaluateGlucoseAlert(household);
assert.equal(alert.shouldAlert, true);
assert.ok(['watch', 'risk', 'critical'].includes(alert.level));

const calmHousehold = {
  ...household,
  dexcom: {
    ...household.dexcom,
    latestGlucose: 110,
    latestTrend: 'flat',
  },
};
const calmAlert = evaluateGlucoseAlert(calmHousehold);
assert.equal(calmAlert.shouldAlert, false);

const defaultState = createDefaultSafetyState(household);
assert.equal(defaultState.stage, 'monitoring');
assert.equal(ensureSafetyState({ ...household, safetyState: defaultState }).stage, 'monitoring');

console.log('T1D smoke checks passed');
