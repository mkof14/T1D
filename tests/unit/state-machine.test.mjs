import { describe, expect, it } from 'vitest';
import {
  actionForDone,
  applySafetyAction,
  createDefaultSafetyState,
  ensureSafetyState,
  operatingMode,
} from '../../server/state-machine.mjs';

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
};

const parentUser = { fullName: 'Anna', email: 'anna@example.com', role: 'parent' };

describe('state-machine', () => {
  it('starts in monitoring stage', () => {
    const state = createDefaultSafetyState(household);
    expect(state.stage).toBe('monitoring');
    expect(state.alertsCount).toBe(0);
  });

  it('applies parent_handling transition', () => {
    const initial = {
      ...createDefaultSafetyState(household),
      stage: 'parent_alerted',
      alertsCount: 1,
    };
    const next = applySafetyAction(parentUser, { ...household, safetyState: initial }, 'parent_handling');
    expect(next.stage).toBe('parent_handling');
  });

  it('resolves to recovery_watch from parent_mark_with_adult', () => {
    const initial = {
      ...createDefaultSafetyState(household),
      stage: 'parent_handling',
      alertsCount: 1,
    };
    const next = applySafetyAction(parentUser, { ...household, safetyState: initial }, 'parent_mark_with_adult');
    expect(next.stage).toBe('recovery_watch');
    expect(next.sessions.length).toBe(1);
  });

  it('maps DONE to a role-aware action', () => {
    const action = actionForDone('parent', operatingMode(), household);
    expect(['parent_handling', 'parent_mark_with_adult', 'parent_escalate']).toContain(action);
  });

  it('normalizes legacy safety state', () => {
    const normalized = ensureSafetyState({
      ...household,
      safetyState: { stage: 'monitoring', responders: ['Anna'], eventLog: [], sessions: [] },
    });
    expect(normalized.stage).toBe('monitoring');
  });
});
