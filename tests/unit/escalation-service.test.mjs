import { describe, expect, it } from 'vitest';
import { shouldEscalate } from '../../server/domain/safety/escalation-policy.mjs';
import { applyEscalationIfNeeded } from '../../server/services/escalation-service.mjs';
import { resetNotificationStore } from '../../server/services/notification-service.mjs';

describe('escalation-service', () => {
  it('escalates when acknowledgement timeout passes', () => {
    resetNotificationStore();
    const notifiedAt = new Date(Date.now() - 130_000).toISOString();
    const household = {
      id: 'hh-1',
      caregiverName: 'Jordan',
      primaryParent: 'Anna',
      safetyPreferences: { caregiverDelaySeconds: 60 },
      safetyState: {
        stage: 'parent_alerted',
        escalationCount: 0,
        responderOwnership: {
          state: 'notified',
          primaryRole: 'parent',
          primaryName: 'Anna',
          alertId: 'alert-1',
          notifiedAt,
        },
        eventLog: [{ id: 'alert-1', kind: 'alert', status: 'active' }],
      },
    };

    expect(shouldEscalate(household.safetyState, { acknowledgementTimeoutSeconds: 60 })).toBe(true);

    const result = applyEscalationIfNeeded(household);
    expect(result.escalated).toBe(true);
    expect(result.household.safetyState.stage).toBe('caregiver_escalated');
    expect(result.household.safetyState.responderOwnership.state).toBe('escalated');
  });

  it('does not escalate when already acknowledged', () => {
    const household = {
      id: 'hh-2',
      safetyState: {
        stage: 'parent_handling',
        responderOwnership: { state: 'acknowledged', alertId: 'alert-2' },
      },
    };

    const result = applyEscalationIfNeeded(household);
    expect(result.escalated).toBe(false);
  });
});
