/** Escalation timing defaults (seconds). */
export const ESCALATION_DEFAULTS = Object.freeze({
  acknowledgementTimeoutSeconds: 120,
  caregiverDelaySeconds: 60,
  maxEscalations: 2,
});

export const shouldEscalate = (safetyState, preferences = {}) => {
  const ownership = safetyState?.responderOwnership || {};
  if (ownership.state === 'acknowledged' || ownership.state === 'active_responder') {
    return false;
  }
  if (ownership.state !== 'notified') return false;
  const notifiedAt = Date.parse(ownership.notifiedAt || safetyState.lastAlertAt || '');
  if (!Number.isFinite(notifiedAt)) return false;
  const timeoutMs = (preferences.acknowledgementTimeoutSeconds || ESCALATION_DEFAULTS.acknowledgementTimeoutSeconds) * 1000;
  return Date.now() - notifiedAt >= timeoutMs;
};

export const buildEscalationTarget = (household, mode = 'night') => {
  const preferences = household?.safetyPreferences || {};
  const primary = mode === 'night' ? preferences.nightPrimaryContact : preferences.dayPrimaryContact;
  if (primary === 'parent' && household?.caregiverName) {
    return { role: 'caregiver', name: household.caregiverName };
  }
  return { role: 'parent', name: household?.primaryParent || 'Parent' };
};
