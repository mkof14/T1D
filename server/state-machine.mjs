import { randomBytes } from 'node:crypto';

const defaultSafetyPreferences = {
  daySensitivity: 'balanced',
  nightSensitivity: 'protective',
  caregiverDelaySeconds: 60,
  dayPrimaryContact: 'parent',
  nightPrimaryContact: 'parent',
};

const resolvePreferences = (household) => ({
  daySensitivity: household?.safetyPreferences?.daySensitivity || defaultSafetyPreferences.daySensitivity,
  nightSensitivity: household?.safetyPreferences?.nightSensitivity || defaultSafetyPreferences.nightSensitivity,
  caregiverDelaySeconds: household?.safetyPreferences?.caregiverDelaySeconds || defaultSafetyPreferences.caregiverDelaySeconds,
  dayPrimaryContact: household?.safetyPreferences?.dayPrimaryContact || defaultSafetyPreferences.dayPrimaryContact,
  nightPrimaryContact: household?.safetyPreferences?.nightPrimaryContact || defaultSafetyPreferences.nightPrimaryContact,
});

const contactNameForRole = (household, role) => {
  if (role === 'caregiver') return household?.caregiverName || household?.primaryParent || 'Caregiver';
  if (role === 'adult') return household?.childName || household?.primaryParent || 'Adult';
  return household?.primaryParent || 'Parent';
};

const contactLabelForRole = (role) => {
  if (role === 'caregiver') return 'Caregiver';
  if (role === 'adult') return 'Adult';
  return 'Parent';
};

const primaryContactRoleForMode = (household, mode) => {
  const preferences = resolvePreferences(household);
  const preferredRole = mode === 'night' ? preferences.nightPrimaryContact : preferences.dayPrimaryContact;
  if (preferredRole === 'caregiver' && !household?.caregiverName) return 'parent';
  return preferredRole;
};

const preferredPrimaryContact = (household, mode) => {
  const role = primaryContactRoleForMode(household, mode);
  return {
    role,
    label: contactLabelForRole(role),
    name: contactNameForRole(household, role),
  };
};

const attemptTime = (baseHour, baseMinute, offsetMinutes = 0) =>
  `${String(baseHour).padStart(2, '0')}:${String(baseMinute + offsetMinutes).padStart(2, '0')}`;

export const createDefaultSafetyState = (household) => ({
  stage: 'parent_alerted',
  responder: preferredPrimaryContact(household, operatingMode()).name,
  acknowledgedAt: `Awaiting ${preferredPrimaryContact(household, operatingMode()).label.toLowerCase()} confirmation`,
  alertsCount: 2,
  escalationCount: 0,
  responders: [preferredPrimaryContact(household, operatingMode()).name],
  eventLog: [
    {
      id: randomBytes(8).toString('hex'),
      step: 'Risk detected',
      actor: 'T1D system',
      time: '02:11',
      detail: 'A fast drop was detected from the CGM trend.',
      status: 'done',
    },
    {
      id: randomBytes(8).toString('hex'),
      step: `${preferredPrimaryContact(household, operatingMode()).label} alerted`,
      actor: preferredPrimaryContact(household, operatingMode()).name,
      time: '02:12',
      detail: `${preferredPrimaryContact(household, operatingMode()).label} received the first alert and opened the case.`,
      status: 'active',
    },
  ],
  sessions: [],
});

export const ensureSafetyState = (household) => {
  const existingSource = household.safetyState || household.nightState;
  if (!existingSource) return createDefaultSafetyState(household);
  const { nightSessions: _legacyNightSessions, ...existing } = existingSource;

  const normalized = {
    ...existing,
    sessions: Array.isArray(existing.sessions) ? existing.sessions : Array.isArray(existingSource.nightSessions) ? existingSource.nightSessions : [],
  };

  if (normalized.stage === 'parent_alerted') {
    const primaryContact = preferredPrimaryContact(household, operatingMode());
    const eventLog = Array.isArray(normalized.eventLog) ? [...normalized.eventLog] : [];
    if (eventLog.length > 0) {
      const lastIndex = eventLog.length - 1;
      eventLog[lastIndex] = {
        ...eventLog[lastIndex],
        step: `${primaryContact.label} alerted`,
        actor: primaryContact.name,
        detail: `${primaryContact.label} received the first alert and opened the case.`,
      };
    }

    return {
      ...normalized,
      responder: primaryContact.name,
      acknowledgedAt: `Awaiting ${primaryContact.label.toLowerCase()} confirmation`,
      responders: Array.from(new Set([primaryContact.name, ...(normalized.responders || [])])),
      eventLog,
    };
  }

  return normalized;
};

export const operatingMode = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7 ? 'night' : 'day';
};

export const signalSnapshotForStage = (mode, stage, household) => {
  const preferences = resolvePreferences(household);
  const daySensitivity = preferences.daySensitivity;
  const nightSensitivity = preferences.nightSensitivity;

  if (mode === 'day' && stage === 'parent_alerted') {
    if (daySensitivity === 'gentle') return { glucose: 104, trend: 'flat', confidence: 'high', dataStatus: 'live', mode };
    if (daySensitivity === 'watchful') return { glucose: 86, trend: 'down', confidence: 'medium', dataStatus: 'live', mode };
    return { glucose: 101, trend: 'flat', confidence: 'high', dataStatus: 'live', mode };
  }
  if (mode === 'day' && stage === 'parent_handling') {
    return daySensitivity === 'watchful'
      ? { glucose: 79, trend: 'down', confidence: 'medium', dataStatus: 'live', mode }
      : { glucose: 88, trend: 'flat', confidence: 'high', dataStatus: 'live', mode };
  }
  if (mode === 'day' && stage === 'caregiver_escalated') {
    return daySensitivity === 'watchful'
      ? { glucose: 63, trend: 'down', confidence: 'high', dataStatus: 'live', mode }
      : { glucose: 67, trend: 'down', confidence: 'medium', dataStatus: 'live', mode };
  }
  if (stage === 'recovery_watch') {
    return { glucose: 96, trend: 'flat', confidence: 'high', dataStatus: 'live', mode };
  }
  if (stage === 'caregiver_escalated') {
    if (nightSensitivity === 'balanced') return { glucose: 67, trend: 'down', confidence: 'medium', dataStatus: 'live', mode };
    if (nightSensitivity === 'urgent') return { glucose: 58, trend: 'down', confidence: 'high', dataStatus: 'live', mode };
    return { glucose: 61, trend: 'down', confidence: 'high', dataStatus: 'live', mode };
  }
  if (stage === 'caregiver_active') {
    return { glucose: 68, trend: 'flat', confidence: 'medium', dataStatus: 'live', mode };
  }
  if (stage === 'parent_handling') {
    if (nightSensitivity === 'balanced') return { glucose: 78, trend: 'flat', confidence: 'high', dataStatus: 'live', mode };
    if (nightSensitivity === 'urgent') return { glucose: 71, trend: 'down', confidence: 'high', dataStatus: 'live', mode };
    return { glucose: 74, trend: 'down', confidence: 'high', dataStatus: 'live', mode };
  }
  if (mode === 'night' && nightSensitivity === 'urgent') {
    return { glucose: 77, trend: 'down', confidence: 'high', dataStatus: 'live', mode };
  }
  return { glucose: 82, trend: 'down', confidence: 'medium', dataStatus: 'live', mode };
};

export const deviceStatusForStage = (mode, stage, household) => {
  const preferences = resolvePreferences(household);
  const minute = new Date().getMinutes();
  const offlineModulo = mode === 'night' && preferences.nightSensitivity === 'urgent' ? 9 : 11;
  const delayedModulo = mode === 'night'
    ? preferences.nightSensitivity === 'urgent' ? 5 : 7
    : preferences.daySensitivity === 'watchful' ? 11 : 13;
  const delayedAge = mode === 'night' && preferences.nightSensitivity === 'urgent' ? 12 : 18;

  if (minute % offlineModulo === 0 && mode === 'night') {
    return {
      name: 'Dexcom CGM',
      status: 'offline',
      lastSync: 'No recent sync',
      signalAgeMinutes: 42,
      lastGoodReading: '42 minutes ago',
      confidenceNote: 'Confidence is low until a new reading arrives.',
      message: 'Device looks offline. Waiting for new sensor data.',
    };
  }
  if (minute % delayedModulo === 0) {
    return {
      name: 'Dexcom CGM',
      status: 'delayed',
      lastSync: `Updated ${delayedAge} minutes ago`,
      signalAgeMinutes: delayedAge,
      lastGoodReading: `${delayedAge} minutes ago`,
      confidenceNote: mode === 'night' ? 'Confidence is reduced and the system stays more protective at night.' : 'Confidence is reduced because the signal is delayed.',
      message: 'Data is delayed. Confidence is reduced until a fresh signal arrives.',
    };
  }
  if (stage === 'recovery_watch') {
    return {
      name: 'Dexcom CGM',
      status: 'connected',
      lastSync: 'Updated 1 minute ago',
      signalAgeMinutes: 1,
      lastGoodReading: '1 minute ago',
      confidenceNote: 'Confidence is high with a fresh stable signal.',
      message: 'Sensor data is current.',
    };
  }
  return {
    name: 'Dexcom CGM',
    status: 'connected',
    lastSync: 'Updated just now',
    signalAgeMinutes: 0,
    lastGoodReading: 'Just now',
    confidenceNote: mode === 'night' ? 'Confidence is high and night monitoring is active.' : 'Confidence is high and daytime monitoring is stable.',
    message: 'Sensor data is flowing normally.',
  };
};

export const actionSetByRole = (role) =>
  role === 'caregiver'
      ? [{ id: 'caregiver_take_over' }, { id: 'caregiver_called_parent' }, { id: 'caregiver_on_way' }]
      : role === 'adult'
        ? [{ id: 'adult_self_monitor' }, { id: 'adult_treated_low' }, { id: 'adult_need_help' }]
        : [{ id: 'parent_handling' }, { id: 'parent_escalate' }, { id: 'parent_mark_with_adult' }];

export const timelineForStage = (_stage, household) => (ensureSafetyState(household).eventLog || []).map((entry, index, all) => ({
  ...entry,
  status: index === all.length - 1 && entry.status !== 'done' ? 'active' : entry.status,
}));

export const notificationFeedForStage = (household) => {
  const safetyState = ensureSafetyState(household);
  const mode = operatingMode();
  const primaryContact = preferredPrimaryContact(household, mode);
  const backupRecipient = household.caregiverName
    ? { role: 'caregiver', name: household.caregiverName }
    : { role: primaryContact.role, name: primaryContact.name };
  const baseHour = mode === 'night' ? 2 : 14;
  const baseMinute = mode === 'night' ? 12 : 20;
  const feed = [
    {
      id: randomBytes(8).toString('hex'),
      recipientRole: primaryContact.role,
      recipientName: primaryContact.name,
      channel: 'push',
      status: safetyState.stage === 'parent_alerted' ? 'delivered' : 'resolved',
      timeLabel: attemptTime(baseHour, baseMinute, 0),
      detail: `${primaryContact.label} received the first safety alert.`,
    },
  ];

  if (safetyState.stage === 'parent_alerted') {
    feed.push({
      id: randomBytes(8).toString('hex'),
      recipientRole: primaryContact.role,
      recipientName: primaryContact.name,
      channel: 'push',
      status: mode === 'night' ? 'retrying' : 'sent',
      timeLabel: attemptTime(baseHour, baseMinute, 1),
      detail: mode === 'night' ? 'A repeat alert is queued to keep the response tight.' : 'A softer follow-up is ready if the first alert is missed.',
    });
  }

  if (safetyState.stage === 'parent_handling') {
    feed.push({
      id: randomBytes(8).toString('hex'),
      recipientRole: primaryContact.role,
      recipientName: primaryContact.name,
      channel: 'push',
      status: 'resolved',
      timeLabel: attemptTime(baseHour, baseMinute, 1),
      detail: 'Delivery was confirmed and the primary responder acknowledged the event.',
    });
  }

  if (safetyState.stage === 'caregiver_escalated' || safetyState.stage === 'caregiver_active') {
    feed.push({
      id: randomBytes(8).toString('hex'),
      recipientRole: primaryContact.role,
      recipientName: primaryContact.name,
      channel: 'push',
      status: 'retrying',
      timeLabel: attemptTime(baseHour, baseMinute, 1),
      detail: 'The first responder did not fully close the loop, so the system repeated the alert.',
    });
    feed.push({
      id: randomBytes(8).toString('hex'),
      recipientRole: backupRecipient.role,
      recipientName: backupRecipient.name,
      channel: 'push',
      status: safetyState.stage === 'caregiver_active' ? 'delivered' : 'escalated',
      timeLabel: attemptTime(baseHour, baseMinute, 2),
      detail: 'Backup support was notified because the critical moment stayed active.',
    });
  }

  if (safetyState.stage === 'recovery_watch') {
    feed.push({
      id: randomBytes(8).toString('hex'),
      recipientRole: primaryContact.role,
      recipientName: primaryContact.name,
      channel: 'push',
      status: 'resolved',
      timeLabel: attemptTime(baseHour, baseMinute, 2),
      detail: 'Alerts were closed after the response moved into recovery watch.',
    });
  }

  return feed;
};

export const notificationSummaryForStage = (household) => {
  const mode = operatingMode();
  const preferences = resolvePreferences(household);
  const primaryContact = preferredPrimaryContact(household, mode);
  const safetyState = ensureSafetyState(household);
  const feed = notificationFeedForStage(household);
  const activeItem = [...feed].reverse().find((item) => item.status !== 'resolved') || feed[feed.length - 1];
  const deliveryStatus =
    safetyState.stage === 'caregiver_escalated' || safetyState.stage === 'caregiver_active'
      ? 'escalated'
      : safetyState.stage === 'parent_alerted'
        ? mode === 'night' ? 'retrying' : 'delivered'
        : safetyState.stage === 'recovery_watch'
          ? 'quiet'
          : 'delivered';

  return {
    mode,
    daySensitivity: preferences.daySensitivity,
    nightSensitivity: preferences.nightSensitivity,
    caregiverDelaySeconds: preferences.caregiverDelaySeconds,
    dayPrimaryContact: preferences.dayPrimaryContact,
    nightPrimaryContact: preferences.nightPrimaryContact,
    caregiverEnabled: Boolean(household?.caregiverName),
    channel: 'push',
    deliveryStatus,
    activeRecipient: activeItem?.recipientRole || primaryContact.role,
    totalAttempts: feed.length,
  };
};

const buildReview = ({ alertsCount, escalationCount, actionsCount, deliveryStatus, responders }) => {
  const stabilityScore = Math.max(52, 92 - escalationCount * 12 - Math.max(0, alertsCount - actionsCount) * 5);
  const deliveryReliability =
    deliveryStatus === 'escalated' ? 'fragile' :
    deliveryStatus === 'retrying' ? 'watch' :
    'strong';
  const responseConsistency =
    escalationCount > 1 ? 'fragile' :
    escalationCount === 1 || actionsCount < alertsCount ? 'watch' :
    'strong';
  const pattern =
    escalationCount > 1 ? 'escalation-heavy' :
    alertsCount > 2 ? 'repeat-risk' :
    'steady';
  const notes = [
    deliveryReliability === 'strong' ? 'Delivery reached the intended responder without heavy friction.' : deliveryReliability === 'watch' ? 'Delivery needed a repeat before the loop was fully covered.' : 'Delivery had to escalate to keep the household covered.',
    responseConsistency === 'strong' ? 'The response loop stayed clear and consistent.' : responseConsistency === 'watch' ? 'The response loop was completed, but it needed extra attention.' : 'The response loop depended on backup support and needs review.',
  ];
  const nextFocus =
    pattern === 'steady' ? 'Keep the same response setup and review only if patterns start repeating.' :
    pattern === 'repeat-risk' ? 'Review sensitivity and response timing before the same pattern repeats.' :
    'Review first-contact routing and backup readiness before the next critical cycle.';

  return {
    headline: pattern === 'steady' ? 'This cycle stayed controlled.' : pattern === 'repeat-risk' ? 'This cycle stayed covered, but the pattern may repeat.' : 'This cycle stayed safe because backup support stepped in.',
    stabilityScore,
    deliveryReliability,
    responseConsistency,
    pattern,
    notes,
    nextFocus,
  };
};

export const currentStateForRole = (role, household, safetyState, user) => {
  const childName = household.childName;
  const parent = household.primaryParent;
  const caregiver = household.caregiverName;
  const mode = operatingMode();
  const preferences = resolvePreferences(household);
  const primaryContact = preferredPrimaryContact(household, mode);
  const caregiverDelayLabel = `${preferences.caregiverDelaySeconds}s`;
  const dayTone = preferences.daySensitivity === 'gentle' ? 'gentle' : preferences.daySensitivity === 'watchful' ? 'watchful' : 'balanced';
  const nightTone = preferences.nightSensitivity === 'balanced' ? 'balanced' : preferences.nightSensitivity === 'urgent' ? 'urgent' : 'protective';

  const baseByStage = {
    parent_alerted: {
      child: {
        level: 'watch',
        headline: mode === 'night' ? 'Stay with an adult and keep your low treatment nearby.' : 'Stay close to an adult and be ready for a quick check.',
        recommendation: mode === 'night' ? `A ${primaryContact.label.toLowerCase()} has been alerted and the night response is starting.` : `A ${primaryContact.label.toLowerCase()} has been alerted and a daytime check-in is starting.`,
      },
      parent: {
        level: mode === 'night' ? 'risk' : 'watch',
        headline: mode === 'night' ? `${childName} is dropping overnight and needs active monitoring.` : `${childName} needs a quick daytime check-in.`,
        recommendation: mode === 'night'
          ? nightTone === 'urgent'
            ? `Respond now. If this is not covered quickly, caregiver backup can step in after ${caregiverDelayLabel}.`
            : `Confirm you are handling the night response or escalate to caregiver backup after ${caregiverDelayLabel}.`
          : dayTone === 'gentle'
            ? 'Check in calmly and confirm the child is covered.'
            : dayTone === 'watchful'
              ? `Check in now and keep caregiver backup reachable after ${caregiverDelayLabel}.`
              : 'Check in now, confirm the child is covered, and move into recovery watch if needed.',
      },
      caregiver: {
        level: 'watch',
        headline: mode === 'night' ? `${childName}'s household is in a ${primaryContact.label.toLowerCase()}-led alert stage.` : `${childName}'s household is in a daytime ${primaryContact.label.toLowerCase()}-led check.`,
        recommendation: mode === 'night' ? `Stay available. Backup can be needed within about ${caregiverDelayLabel}.` : `Stay reachable in case the family needs extra daytime support after ${caregiverDelayLabel}.`,
      },
      adult: {
        level: 'watch',
        headline: mode === 'night' ? 'Safety monitoring is active and your support plan is ready.' : 'A daytime change needs a quick check.',
        recommendation: mode === 'night' ? 'Stay alert, keep treatment nearby, and ask for backup if needed.' : dayTone === 'gentle' ? 'Make a calm check now and keep treatment nearby.' : 'Check in now, keep treatment nearby, and move into recovery watch if needed.',
      },
    },
    parent_handling: {
      child: {
        level: 'watch',
        headline: mode === 'night' ? 'An adult is already with you and handling the night alert.' : 'An adult is already checking in and handling this.',
        recommendation: 'Stay calm and keep your treatment nearby.',
      },
      parent: {
        level: 'watch',
        headline: mode === 'night' ? `You are the active responder for ${childName}'s night event.` : `You are actively covering ${childName}'s daytime safety check.`,
        recommendation: mode === 'night' ? 'Continue treatment, keep the child with an adult, and watch for recovery.' : 'Confirm the child is covered and move into recovery watch once the immediate step is done.',
      },
      caregiver: {
        level: 'watch',
        headline: mode === 'night' ? `${childName}'s parent is actively handling the night event.` : `${childName}'s parent is actively handling this daytime check.`,
        recommendation: mode === 'night' ? 'Remain on standby in case the family asks for backup.' : 'Remain available in case the family asks for support.',
      },
      adult: {
        level: 'watch',
        headline: mode === 'night' ? 'You have acknowledged the night event.' : 'You have acknowledged the daytime check.',
        recommendation: 'Stay in observation until recovery stabilizes.',
      },
    },
    caregiver_escalated: {
      child: {
        level: 'critical',
        headline: mode === 'night' ? 'Backup support has been called in. Stay with an adult now.' : 'Extra support has been called in. Stay with an adult now.',
        recommendation: 'Do not stay alone. Follow the adult helping you.',
      },
      parent: {
        level: 'critical',
        headline: mode === 'night' ? `Backup caregiver support has been escalated for ${childName}.` : `Extra daytime support has been escalated for ${childName}.`,
        recommendation: mode === 'night' ? 'Stay with the child until the caregiver confirms takeover.' : 'Stay with the child until extra support confirms coverage.',
      },
      caregiver: {
        level: 'critical',
        headline: mode === 'night' ? `${childName}'s night alert has escalated to caregiver backup.` : `${childName}'s daytime safety check has escalated to caregiver backup.`,
        recommendation: 'Review the case, contact the family, and take over if needed.',
      },
      adult: {
        level: 'critical',
        headline: 'Backup support has been escalated.',
        recommendation: 'Stay engaged and confirm who is responding now.',
      },
    },
    caregiver_active: {
      child: {
        level: 'watch',
        headline: 'A caregiver has taken over and is helping now.',
        recommendation: 'Stay close to the adult who is responding.',
      },
      parent: {
        level: 'watch',
        headline: `Caregiver backup is now leading ${childName}'s response.`,
        recommendation: 'Support the caregiver and keep the child calm.',
      },
      caregiver: {
        level: 'watch',
        headline: `You are the active caregiver responder for ${childName}.`,
        recommendation: 'Coordinate with the parent and keep recovery monitoring active.',
      },
      adult: {
        level: 'watch',
        headline: 'Backup support is active.',
        recommendation: 'Stay in contact until the event stabilizes.',
      },
    },
    recovery_watch: {
      child: {
        level: 'recovery',
        headline: 'Recovery watch is active and adults are still monitoring you.',
        recommendation: 'Stay nearby and keep following the adult plan.',
      },
      parent: {
        level: 'recovery',
        headline: mode === 'night' ? `${childName} is in recovery watch after the night event.` : `${childName} is in recovery watch after the daytime check.`,
        recommendation: mode === 'night' ? 'Keep monitoring until the system confirms stable recovery.' : 'Keep a lighter check on recovery until the system confirms stable recovery.',
      },
      caregiver: {
        level: 'recovery',
        headline: `${childName} has moved into recovery watch.`,
        recommendation: mode === 'night' ? 'Stay available until the parent confirms the night is stable.' : 'Stay available until the parent confirms the day is stable.',
      },
      adult: {
        level: 'recovery',
        headline: 'You are now in recovery watch.',
        recommendation: mode === 'night' ? 'Continue observing until recovery is stable.' : 'Keep a lighter watch until recovery is stable.',
      },
    },
  };

  const next = baseByStage[safetyState.stage]?.[role] || baseByStage.parent_alerted.parent;
  const signal = signalSnapshotForStage(mode, safetyState.stage, household);
  const device = deviceStatusForStage(mode, safetyState.stage, household);
  const stateWithData =
    signal.dataStatus === 'offline' || device.status === 'offline'
      ? {
          ...next,
          level: 'watch',
          headline: 'Waiting for data',
          recommendation: 'The system is waiting for a fresh sensor signal before it takes action.',
        }
      : signal.dataStatus === 'delayed' || device.status === 'delayed'
        ? {
            ...next,
            headline: 'Data is delayed',
            recommendation: 'The system is still watching, but confidence is lower until fresh data arrives.',
          }
        : next;
  return {
    ...stateWithData,
    ...signal,
    message: stateWithData.headline,
    responder: safetyState.responder || primaryContact.name || (role === 'caregiver' ? caregiver : role === 'adult' ? user.fullName : parent),
    acknowledgedAt: safetyState.acknowledgedAt || 'Just now',
  };
};

export const applySafetyAction = (user, household, action) => {
  const current = ensureSafetyState(household);
  const mode = operatingMode();
  const primaryContact = preferredPrimaryContact(household, mode);
  const next = {
    ...current,
    responders: Array.from(new Set(current.responders || [])),
    eventLog: Array.isArray(current.eventLog) ? [...current.eventLog] : [],
    sessions: Array.isArray(current.sessions) ? [...current.sessions] : [],
  };

  if (action === 'parent_handling' || action === 'adult_self_monitor') {
    next.stage = 'parent_handling';
    next.responder = action === 'adult_self_monitor' ? (user.fullName || user.email) : primaryContact.name;
    next.acknowledgedAt = 'Acknowledged just now';
    next.responders = Array.from(new Set([...next.responders, next.responder]));
  }

  if (action === 'parent_escalate' || action === 'adult_need_help') {
    next.stage = 'caregiver_escalated';
    next.responder = household.caregiverName || household.primaryParent;
    next.acknowledgedAt = 'Escalated just now';
    next.escalationCount = (next.escalationCount || 0) + 1;
    next.responders = Array.from(new Set([...next.responders, primaryContact.name, next.responder]));
  }

  if (action === 'caregiver_take_over' || action === 'caregiver_called_parent') {
    next.stage = 'caregiver_active';
    next.responder = household.caregiverName;
    next.acknowledgedAt = action === 'caregiver_called_parent' ? 'Caregiver contacted parent just now' : 'Caregiver took over just now';
    next.escalationCount = Math.max(next.escalationCount || 0, 1);
    next.responders = Array.from(new Set([...next.responders, household.caregiverName]));
  }

  if (action === 'parent_mark_with_adult' || action === 'caregiver_on_way' || action === 'adult_treated_low') {
    next.stage = 'recovery_watch';
    next.responder = current.responder || household.primaryParent;
    next.acknowledgedAt = 'Recovery watch started just now';
  }

  const outcomeByStage = {
    parent_alerted: 'An alert is active and waiting for confirmation.',
    parent_handling: 'The primary responder has the situation in hand and the child is not alone.',
    caregiver_escalated: 'Backup caregiver support has been activated to keep the household covered.',
    caregiver_active: 'Caregiver backup is actively covering the family while recovery is being managed.',
    recovery_watch: 'Recovery is being monitored and the household remains covered.',
  };

  next.outcome = outcomeByStage[next.stage];
  next.eventLog = next.eventLog.map((entry, index, all) => ({
    ...entry,
    status: index === all.length - 1 ? entry.status : 'done',
  }));
  next.eventLog.push({
    id: randomBytes(8).toString('hex'),
    step:
      action === 'parent_handling' ? 'Parent handling confirmed' :
      action === 'parent_escalate' ? 'Caregiver escalated' :
      action === 'parent_mark_with_adult' ? 'Recovery watch started' :
      action === 'caregiver_take_over' ? 'Caregiver took over' :
      action === 'caregiver_called_parent' ? 'Caregiver contacted parent' :
      action === 'caregiver_on_way' ? 'Caregiver on the way' :
      action === 'adult_self_monitor' ? 'Adult self-monitoring' :
      action === 'adult_treated_low' ? 'Adult treated low' :
      'Adult requested backup',
    actor: user.fullName || user.email,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    detail: next.outcome,
    status: next.stage === 'recovery_watch' ? 'done' : 'active',
  });

  if (next.stage === 'recovery_watch') {
    const review = buildReview({
      alertsCount: next.alertsCount || 2,
      escalationCount: next.escalationCount || 0,
      actionsCount: Math.max(1, (next.responders || []).length - 1),
      deliveryStatus: (next.escalationCount || 0) > 0 ? 'escalated' : 'delivered',
      responders: next.responders || [household.primaryParent],
    });
    next.sessions.unshift({
      id: randomBytes(8).toString('hex'),
      headline: `${household.childName} completed a daily recovery cycle`,
      dateLabel: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      outcome: next.outcome,
      alertsCount: next.alertsCount || 2,
      actionsCount: Math.max(1, (next.responders || []).length - 1),
      escalationCount: next.escalationCount || 0,
      responders: next.responders || [household.primaryParent],
      timeline: next.eventLog.map((entry) => ({ ...entry, status: 'done' })),
      review,
    });
    next.sessions = next.sessions.slice(0, 6);
  }

  return next;
};

export const actionForDone = (role, mode, household) => {
  const preferences = resolvePreferences(household);
  if (mode === 'day') {
    if (role === 'adult') return preferences.daySensitivity === 'watchful' ? 'adult_self_monitor' : 'adult_treated_low';
    if (role === 'caregiver') return preferences.daySensitivity === 'watchful' ? 'caregiver_take_over' : 'caregiver_called_parent';
    return preferences.daySensitivity === 'watchful' ? 'parent_handling' : 'parent_mark_with_adult';
  }

  if (role === 'adult') return preferences.nightSensitivity === 'balanced' ? 'adult_treated_low' : 'adult_self_monitor';
  if (role === 'caregiver') return preferences.nightSensitivity === 'urgent' ? 'caregiver_take_over' : 'caregiver_called_parent';
  return preferences.nightSensitivity === 'balanced' ? 'parent_mark_with_adult' : 'parent_handling';
};

export const createDefaultNightState = createDefaultSafetyState;
export const ensureNightState = ensureSafetyState;
export const applyNightAction = applySafetyAction;
