export const RESPONDER_STATES = Object.freeze([
  'no_responder',
  'notified',
  'acknowledged',
  'active_responder',
  'escalated',
  'resolved',
  'expired',
]);

export const mapStageToResponderState = (safetyState = {}) => {
  const stage = safetyState.stage || 'monitoring';
  const ownership = safetyState.responderOwnership?.state;
  if (ownership) return ownership;
  if (stage === 'monitoring' || stage === 'recovery_watch') return 'no_responder';
  if (stage === 'parent_alerted') return 'notified';
  if (stage === 'parent_handling') return 'active_responder';
  if (stage === 'caregiver_escalated') return 'escalated';
  if (stage === 'caregiver_active') return 'active_responder';
  if (stage === 'resolved') return 'resolved';
  return 'notified';
};

const nowLabel = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const appendEvent = (safetyState, event) => ({
  ...safetyState,
  eventLog: [...(Array.isArray(safetyState.eventLog) ? safetyState.eventLog : []), event],
});

export const getActiveAlert = (safetyState) => {
  const log = Array.isArray(safetyState?.eventLog) ? safetyState.eventLog : [];
  return log.find((entry) => entry.kind === 'alert' && entry.status === 'active') || null;
};

export const acknowledgeAlert = (household, user, alertId) => {
  const safetyState = household.safetyState || {};
  const active = getActiveAlert(safetyState);
  if (!active || (alertId && active.id !== alertId)) {
    return { ok: false, error: 'alert_not_found' };
  }
  if (safetyState.responderOwnership?.state === 'active_responder'
    && safetyState.responderOwnership?.userId !== user.id) {
    return { ok: false, error: 'another_responder_active' };
  }

  const event = {
    id: `ack-${Date.now()}`,
    kind: 'acknowledgement',
    step: 'Acknowledged',
    actor: user.fullName || user.email,
    time: nowLabel(),
    detail: `${user.fullName || user.email} acknowledged the alert.`,
    status: 'done',
    userId: user.id,
    alertId: active.id,
  };

  return {
    ok: true,
    safetyState: appendEvent({
      ...safetyState,
      stage: safetyState.stage === 'parent_alerted' ? 'parent_handling' : safetyState.stage,
      acknowledgedAt: `${user.fullName || user.email} acknowledged`,
      responderOwnership: {
        state: 'acknowledged',
        userId: user.id,
        name: user.fullName || user.email,
        role: user.role,
        acknowledgedAt: new Date().toISOString(),
        alertId: active.id,
      },
    }, event),
  };
};

export const takeOwnership = (household, user, alertId) => {
  const safetyState = household.safetyState || {};
  const active = getActiveAlert(safetyState);
  if (!active || (alertId && active.id !== alertId)) {
    return { ok: false, error: 'alert_not_found' };
  }
  const current = safetyState.responderOwnership;
  if (current?.state === 'active_responder' && current.userId !== user.id) {
    return { ok: false, error: 'another_responder_active' };
  }

  const event = {
    id: `own-${Date.now()}`,
    kind: 'ownership',
    step: 'Handling',
    actor: user.fullName || user.email,
    time: nowLabel(),
    detail: `${user.fullName || user.email} marked "I'm handling this".`,
    status: 'active',
    userId: user.id,
    alertId: active.id,
  };

  return {
    ok: true,
    safetyState: appendEvent({
      ...safetyState,
      stage: user.role === 'caregiver' ? 'caregiver_active' : 'parent_handling',
      responder: user.fullName || user.email,
      responderOwnership: {
        state: 'active_responder',
        userId: user.id,
        name: user.fullName || user.email,
        role: user.role,
        handlingSince: new Date().toISOString(),
        alertId: active.id,
      },
    }, event),
  };
};

export const resolveAlert = (household, user, alertId) => {
  const safetyState = household.safetyState || {};
  const active = getActiveAlert(safetyState);
  if (!active || (alertId && active.id !== alertId)) {
    return { ok: false, error: 'alert_not_found' };
  }

  const event = {
    id: `resolve-${Date.now()}`,
    kind: 'resolution',
    step: 'Resolved',
    actor: user.fullName || user.email,
    time: nowLabel(),
    detail: `${user.fullName || user.email} marked the event resolved.`,
    status: 'done',
    userId: user.id,
    alertId: active.id,
  };

  const nextLog = (Array.isArray(safetyState.eventLog) ? safetyState.eventLog : []).map((entry) =>
    entry.id === active.id ? { ...entry, status: 'resolved' } : entry
  );

  return {
    ok: true,
    safetyState: appendEvent({
      ...safetyState,
      stage: 'recovery_watch',
      acknowledgedAt: 'Monitoring recovery',
      responderOwnership: {
        state: 'resolved',
        userId: user.id,
        name: user.fullName || user.email,
        role: user.role,
        resolvedAt: new Date().toISOString(),
        alertId: active.id,
      },
      eventLog: nextLog,
    }, event),
  };
};
