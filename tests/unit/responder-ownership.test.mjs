import { describe, expect, it } from 'vitest';
import {
  acknowledgeAlert,
  getActiveAlert,
  resolveAlert,
  takeOwnership,
} from '../../server/domain/safety/responder-ownership.mjs';

const user = { id: 'u1', fullName: 'Anna', email: 'anna@example.com', role: 'parent' };
const caregiver = { id: 'u2', fullName: 'Jordan', email: 'jordan@example.com', role: 'caregiver' };

const householdWithAlert = () => ({
  id: 'hh-1',
  safetyState: {
    stage: 'parent_alerted',
    eventLog: [
      {
        id: 'alert-1',
        kind: 'alert',
        status: 'active',
        step: 'Risk detected',
        detail: 'Test alert',
      },
    ],
    responderOwnership: { state: 'notified', alertId: 'alert-1' },
  },
});

describe('responder ownership', () => {
  it('acknowledges an active alert', () => {
    const result = acknowledgeAlert(householdWithAlert(), user, 'alert-1');
    expect(result.ok).toBe(true);
    expect(result.safetyState.responderOwnership.state).toBe('acknowledged');
  });

  it('blocks second active responder', () => {
    const owned = takeOwnership(householdWithAlert(), user, 'alert-1');
    expect(owned.ok).toBe(true);
    const household = { ...householdWithAlert(), safetyState: owned.safetyState };
    const blocked = takeOwnership(household, caregiver, 'alert-1');
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toBe('another_responder_active');
  });

  it('resolves alert and marks event resolved', () => {
    const ack = acknowledgeAlert(householdWithAlert(), user, 'alert-1');
    const own = takeOwnership({ ...householdWithAlert(), safetyState: ack.safetyState }, user, 'alert-1');
    const resolved = resolveAlert({ ...householdWithAlert(), safetyState: own.safetyState }, user, 'alert-1');
    expect(resolved.ok).toBe(true);
    const alertEntry = resolved.safetyState.eventLog.find((entry) => entry.id === 'alert-1');
    expect(alertEntry?.status).toBe('resolved');
  });
});
