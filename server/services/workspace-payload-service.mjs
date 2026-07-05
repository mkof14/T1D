import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  actionSetByRole,
  currentStateForRole,
  deviceStatusForStage,
  ensureSafetyState,
  notificationFeedForStage,
  notificationSummaryForStage,
  timelineForStage,
} from '../state-machine.mjs';
import { dexcomPayloadForHousehold, ensureDexcomConnection } from '../dexcom-service.mjs';
import { defaultSafetyPreferences, normalizeDiabetesType } from '../diabetes-type.mjs';
import { buildNutritionPayload } from '../nutrition-service.mjs';
import { requestLang } from '../backend-i18n.mjs';
import { localizeWorkspacePayload } from '../workspace-i18n.mjs';
import { ensureDexcomOps } from '../dexcom-ops.mjs';

const safeText = (value, max = 160) => String(value || '').trim().slice(0, max);

const buildHouseholdMembers = (household, fallbackParent, fallbackCaregiver) => {
  const members = Array.isArray(household.members) ? household.members : [];
  return members.map((member, index) => ({
    id: member.id || `member-${index}`,
    fullName: member.fullName || (member.role === 'parent' ? fallbackParent : member.role === 'caregiver' ? fallbackCaregiver : 'Adult Member'),
    email: member.email || '',
    role: member.role || 'parent',
    status: member.status === 'invited' ? 'invited' : 'active',
  }));
};

const buildDexcomHealthSummary = (household, dexcom) => {
  const ops = ensureDexcomOps(household);
  const authBroken = dexcom.status === 'error' && dexcom.tokenStatus === 'missing';
  const repeatedFailures = ops.consecutiveFailures >= 3;
  const rateLimited = dexcom.requestHealth === 'rate_limited';
  const state = authBroken || repeatedFailures ? 'broken' : rateLimited || dexcom.requestHealth === 'failed' || dexcom.dataFreshness === 'offline' ? 'watch' : 'healthy';
  const reason =
    authBroken
      ? 'broken_auth'
      : repeatedFailures
        ? 'repeated_failures'
        : rateLimited
          ? 'rate_limited'
          : dexcom.dataFreshness === 'offline' || dexcom.dataFreshness === 'stale'
            ? 'degraded_data'
            : dexcom.requestHealth === 'failed'
              ? 'request_failed'
              : 'ok';
  return {
    state,
    reason,
    headline:
      authBroken
        ? 'Dexcom needs a fresh authorization.'
        : repeatedFailures
          ? 'Dexcom has repeated failures and needs attention.'
          : rateLimited
            ? 'Dexcom is rate limited and backing off.'
            : dexcom.requestHealth === 'failed'
              ? 'Dexcom requests are failing and being watched.'
              : 'Dexcom sync is healthy.',
    detail:
      authBroken
        ? 'The integration no longer has a usable token. Run OAuth again to restore live sync.'
        : repeatedFailures
          ? 'Several sync attempts failed in a row. Keep the household in a safer fallback mode until the connection stabilizes.'
          : rateLimited
            ? 'The integration is respecting Dexcom rate limits and has delayed the next poll.'
            : dexcom.requestHealth === 'failed'
              ? (dexcom.lastError || 'Recent Dexcom requests failed and the system has slowed polling temporarily.')
              : 'Live data, token state, and polling cadence are operating normally.',
    nextStep:
      authBroken
        ? 'Run Dexcom OAuth again to restore live access.'
        : repeatedFailures
          ? 'Review connection health and wait for the scheduler to retry on the next safe window.'
          : rateLimited
            ? 'Let the scheduler wait until the cooldown ends before trying again.'
            : dexcom.dataFreshness === 'offline' || dexcom.dataFreshness === 'stale'
              ? 'Keep watching the device and wait for fresher CGM data before reacting hard.'
              : dexcom.requestHealth === 'failed'
                ? 'Let the background worker retry. If failures continue, reconnect Dexcom.'
                : 'No action is needed. The integration can continue in normal mode.',
    lastSuccessAt: ops.lastSuccessAt,
    lastFailureAt: ops.lastFailureAt,
    consecutiveFailures: ops.consecutiveFailures,
  };
};

const buildDexcomSchedulerSummary = (household) => {
  const ops = ensureDexcomOps(household);
  return {
    state: ops.workerState,
    headline:
      ops.workerState === 'paused'
        ? 'Background sync is paused while the integration cools down.'
        : ops.workerState === 'running'
          ? 'Background sync is actively processing the next Dexcom cycle.'
          : ops.workerState === 'scheduled'
            ? 'Background sync is scheduled and waiting for the next safe run window.'
            : 'Background sync is idle until a Dexcom cycle is due.',
    nextRunAt: ops.nextWorkerRunAt,
    lastRunAt: ops.lastWorkerRunAt,
    pausedUntil: ops.pausedUntil,
  };
};

const buildDailyGuidance = (user, household, currentState, dexcomHealth) => {
  const childName = household.childName || 'your child';
  const roleTitle =
    user.role === 'parent'
      ? 'Parent Daily Guidance'
      : user.role === 'caregiver'
        ? 'Caregiver Daily Guidance'
        : 'Daily Guidance';

  const fallback =
    dexcomHealth.reason === 'broken_auth'
      ? 'Restore Dexcom authorization before relying on live sync again.'
      : dexcomHealth.reason === 'rate_limited'
        ? 'Wait through the cooldown window and avoid forcing extra refreshes.'
        : dexcomHealth.reason === 'degraded_data'
          ? 'Treat sensor data as lower confidence until fresher readings arrive.'
          : dexcomHealth.reason === 'repeated_failures' || dexcomHealth.reason === 'request_failed'
            ? 'Stay in a safer fallback mode while the system retries in the background.'
            : 'Keep the routine simple and let the system continue in normal mode.';

  if (user.role === 'caregiver') {
    return {
      title: roleTitle,
      now: `Stay ready to support ${childName} if the primary responder needs backup.`,
      watch: 'Watch who is responding, whether recovery is moving, and whether data confidence is dropping.',
      fallback,
      checklist: [
        'Confirm the current responder before stepping in.',
        'Keep your phone available during the current watch window.',
        'Use fallback support if data quality drops or the parent misses the response.',
      ],
    };
  }

  if (user.role === 'adult') {
    return {
      title: roleTitle,
      now: 'Keep the current state simple: know the reading, the trend, and the next safe action.',
      watch: 'Watch for falling confidence, delayed data, and whether recovery is actually stabilizing.',
      fallback,
      checklist: [
        'Keep treatment close during watch or recovery states.',
        'Use DONE only after you have actually responded.',
        'Slow down decisions when data is stale or offline.',
      ],
    };
  }

  return {
    title: roleTitle,
    now: `Keep ${childName}'s current state, responder, and recovery path clear at a glance.`,
    watch: 'Watch for delayed data, repeated alerts, or a shift from stable monitoring into backup support.',
    fallback,
    checklist: [
      'Keep treatment and backup contact details easy to reach.',
      'Confirm who is responding before escalating further.',
      'If data confidence drops, check the sensor connection before reacting hard.',
    ],
  };
};

const buildHouseholdReadiness = (household, currentState, dexcomHealth, notificationSummary) => {
  const caregiverReady = Boolean(safeText(household.caregiverName, 120));
  const responderStable = Boolean(currentState.responder && currentState.responder !== 'Unassigned');
  const recoveryCovered = currentState.level === 'recovery' || currentState.level === 'ok';
  const connectionReady = dexcomHealth.state === 'healthy';
  const state =
    connectionReady && responderStable && (caregiverReady || notificationSummary.activeRecipient !== 'caregiver')
      ? 'ready'
      : dexcomHealth.state === 'broken' || !responderStable
        ? 'needs_attention'
        : 'watch';

  return {
    state,
    headline:
      state === 'ready'
        ? 'The household is ready for the current safety cycle.'
        : state === 'watch'
          ? 'The household is covered, but one part of readiness still needs watching.'
          : 'The household needs attention before this safety cycle is fully covered.',
    connection:
      dexcomHealth.reason === 'ok'
        ? 'Connection looks stable and live data is usable.'
        : dexcomHealth.nextStep,
    backup:
      caregiverReady
        ? `Backup support is available through ${household.caregiverName}.`
        : 'No backup caregiver is configured yet.',
    responder:
      responderStable
        ? `${currentState.responder} is the current responder.`
        : 'No clear responder is set right now.',
    recovery:
      recoveryCovered
        ? 'Recovery is either stable already or covered if the cycle changes.'
        : 'Recovery needs active watching until the state settles.',
  };
};

const buildContextualSummary = (user, household, currentState, dexcomHealth, householdReadiness) => {
  const childName = household.childName || 'your child';

  if (dexcomHealth.reason === 'broken_auth') {
    return {
      tone: 'attention',
      headline: 'Live sync needs to be restored.',
      detail: 'Dexcom authorization is no longer active, so the household should treat sensor support as unavailable until OAuth is restored.',
    };
  }

  if (dexcomHealth.reason === 'rate_limited') {
    return {
      tone: 'watch',
      headline: 'The system is cooling down after too many Dexcom requests.',
      detail: 'The next sync is already scheduled. There is no need to force extra refreshes right now.',
    };
  }

  if (currentState.level === 'recovery') {
    return {
      tone: 'watch',
      headline: 'Recovery is active and should stay calm.',
      detail: user.role === 'caregiver'
        ? `Stay available while ${childName} remains in recovery watch and avoid adding noise unless support is needed.`
        : 'Keep the current recovery watch simple and steady until the state clearly settles again.',
    };
  }

  if (currentState.dataStatus === 'offline' || currentState.dataStatus === 'delayed') {
    return {
      tone: 'watch',
      headline: 'Data confidence is reduced right now.',
      detail: 'Use the current state as guidance, but slow down decisions and confirm the sensor connection before reacting hard.',
    };
  }

  if (householdReadiness.state === 'needs_attention' || currentState.level === 'critical') {
    return {
      tone: 'attention',
      headline: 'The household needs a clear next step right now.',
      detail: user.role === 'caregiver'
        ? 'Confirm who is leading the response and be ready to step in without adding confusion.'
        : 'Keep the responder, the treatment step, and the backup path explicit until the cycle is covered.',
    };
  }

  if (currentState.level === 'watch' || currentState.level === 'risk') {
    return {
      tone: 'watch',
      headline: 'The day is stable, but this cycle still needs watching.',
      detail: 'Nothing needs a dramatic response yet. Stay close to the current trend, data quality, and responder status.',
    };
  }

  return {
    tone: 'calm',
    headline: 'The household is in a steady daily support state.',
    detail: user.role === 'adult'
      ? 'Keep the routine simple, let the system monitor in the background, and only step up if the state changes.'
      : `The household is covered right now, and ${childName}'s support loop can stay calm and predictable.`,
  };
};

export const buildWorkspacePayload = (user, household = null) => {
  if (!household) {
    return {
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization || '',
      },
      needsSetup: true,
      household: null,
      currentState: null,
      deviceStatus: null,
      dexcomConnection: null,
      dexcomHealth: null,
      dexcomScheduler: null,
      dexcomAuditTrail: [],
      dailyGuidance: null,
      householdReadiness: null,
      contextualSummary: null,
      notificationSummary: null,
      notificationFeed: [],
      timeline: [],
      recentEvents: [],
      morningSummary: null,
      reviewSummary: null,
      dailyHistory: [],
      selectedSession: null,
      quickActions: [],
      nutrition: null,
    };
  }

  const childName = household.childName || (user.role === 'child' ? user.fullName : 'Mila');
  const primaryParent = household.primaryParent || (user.role === 'parent' ? user.fullName : 'Anna Rivera');
  const caregiverName = household.caregiverName || (user.role === 'caregiver' ? user.fullName : 'Jordan Lee');
  const householdName = household.householdName || `${childName} Safety Circle`;
  const safetyState = ensureSafetyState(household);
  const dexcom = ensureDexcomConnection(household);
  const currentStateBase = currentStateForRole(user.role, household, safetyState, user);
  const currentState = dexcom.status === 'connected' || dexcom.status === 'error'
    ? {
        ...currentStateBase,
        glucose: dexcom.latestGlucose ?? currentStateBase.glucose,
        trend: dexcom.latestTrend || currentStateBase.trend,
        dataStatus:
          dexcom.dataFreshness === 'live'
            ? 'live'
            : dexcom.dataFreshness === 'delayed'
              ? 'delayed'
              : dexcom.dataFreshness === 'stale'
                ? 'delayed'
                : 'offline',
        confidence:
          dexcom.dataFreshness === 'live'
            ? 'high'
            : dexcom.dataFreshness === 'delayed'
              ? 'medium'
              : 'low',
        recommendation:
          dexcom.dataFreshness === 'offline'
            ? 'Dexcom data is offline. Confirm the sensor connection before relying on the current reading.'
            : dexcom.dataFreshness === 'stale'
              ? 'Dexcom data is stale. Keep watch, but wait for a fresher reading before escalating hard.'
              : currentStateBase.recommendation,
      }
    : currentStateBase;
  const deviceStatusBase = deviceStatusForStage(currentState.mode, safetyState.stage, household);
  const deviceStatus = dexcom.status === 'connected' || dexcom.status === 'error'
    ? {
        ...deviceStatusBase,
        name: 'Dexcom CGM',
        status:
          dexcom.dataFreshness === 'live'
            ? 'connected'
            : dexcom.dataFreshness === 'offline'
              ? 'offline'
              : 'delayed',
        lastSync: dexcom.lastSync || deviceStatusBase.lastSync,
        signalAgeMinutes: dexcom.latestTimestamp ? Math.max(0, Math.round((Date.now() - Date.parse(dexcom.latestTimestamp)) / 60000)) : deviceStatusBase.signalAgeMinutes,
        lastGoodReading: dexcom.latestTimestamp
          ? `${Math.max(0, Math.round((Date.now() - Date.parse(dexcom.latestTimestamp)) / 60000))} minutes ago`
          : deviceStatusBase.lastGoodReading,
        confidenceNote:
          dexcom.dataFreshness === 'live'
            ? 'Confidence is based on live Dexcom readings.'
            : dexcom.dataFreshness === 'delayed'
              ? 'Confidence is reduced because Dexcom data is delayed.'
              : dexcom.dataFreshness === 'stale'
                ? 'Confidence is reduced because Dexcom data is stale.'
                : 'Confidence is low because Dexcom data is offline.',
        message: dexcom.message || deviceStatusBase.message,
      }
    : deviceStatusBase;
  const dexcomConnection = dexcomPayloadForHousehold(household);
  const dexcomHealth = buildDexcomHealthSummary(household, dexcomConnection);
  const dexcomScheduler = buildDexcomSchedulerSummary(household);
  const dexcomAuditTrail = ensureDexcomOps(household).auditTrail;
  const dailyGuidance = buildDailyGuidance(user, household, currentState, dexcomHealth);
  const safetyPreferences = {
    ...defaultSafetyPreferences(normalizeDiabetesType(household.diabetesType)),
    ...(household.safetyPreferences || {}),
  };
  const sessions = Array.isArray(safetyState.sessions) ? safetyState.sessions : [];
  const timeline = timelineForStage(safetyState.stage, household);
  const notificationSummary = notificationSummaryForStage(household);
  const householdReadiness = buildHouseholdReadiness(household, currentState, dexcomHealth, notificationSummary);
  const contextualSummary = buildContextualSummary(user, household, currentState, dexcomHealth, householdReadiness);
  const notificationFeed = notificationFeedForStage(household);
  const reviewSummary = {
    headline:
      notificationSummary.deliveryStatus === 'escalated'
        ? 'Delivery needed backup to keep this cycle covered.'
        : notificationSummary.deliveryStatus === 'retrying'
          ? 'Delivery is still in progress and being watched closely.'
          : safetyState.stage === 'recovery_watch'
            ? 'This cycle is now in review and recovery.'
            : 'This cycle is moving with a stable response path.',
    stabilityScore: Math.max(52, 92 - (safetyState.escalationCount || 0) * 12 - Math.max(0, (safetyState.alertsCount || 2) - Math.max(1, (safetyState.responders || []).length - 1)) * 5),
    deliveryReliability:
      notificationSummary.deliveryStatus === 'escalated'
        ? 'fragile'
        : notificationSummary.deliveryStatus === 'retrying'
          ? 'watch'
          : 'strong',
    responseConsistency:
      (safetyState.escalationCount || 0) > 1
        ? 'fragile'
        : (safetyState.escalationCount || 0) === 1
          ? 'watch'
          : 'strong',
    pattern:
      (safetyState.escalationCount || 0) > 1
        ? 'escalation-heavy'
        : (safetyState.alertsCount || 2) > 2
          ? 'repeat-risk'
          : 'steady',
    notes: [
      notificationSummary.deliveryStatus === 'escalated'
        ? 'Delivery had to escalate to keep the household covered.'
        : notificationSummary.deliveryStatus === 'retrying'
          ? 'Delivery needed at least one repeat before the loop settled.'
          : 'Delivery reached the intended responder cleanly.',
      (safetyState.escalationCount || 0) > 0
        ? 'Backup support was part of this response cycle.'
        : 'The primary response path stayed stable through the cycle.',
    ],
    nextFocus:
      (safetyState.escalationCount || 0) > 1
        ? 'Review routing and backup readiness before the next critical cycle.'
        : (safetyState.alertsCount || 2) > 2
          ? 'Review sensitivity and timing before this pattern repeats.'
          : 'Keep the same setup and watch only for repeated patterns.',
  };

  return {
    user: {
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organization: user.organization || '',
    },
    needsSetup: false,
    household: {
      householdName,
      childName,
      childAgeBand: household.childAgeBand || '8-12',
      primaryParent,
      caregiverName,
      nightWindow: household.nightWindow || '10:00 PM - 7:00 AM',
      diabetesType: normalizeDiabetesType(household.diabetesType),
      inviteCode: household.inviteCode || '',
      members: buildHouseholdMembers(household, primaryParent, caregiverName),
      safetyPreferences,
    },
    currentState,
    deviceStatus,
    dexcomConnection,
    dexcomHealth,
    dexcomScheduler,
    dexcomAuditTrail,
    dailyGuidance,
    householdReadiness,
    contextualSummary,
    notificationSummary,
    notificationFeed,
    timeline,
    recentEvents: timeline.slice(-3).reverse(),
    morningSummary: {
      headline: `${childName} had ${safetyState.alertsCount || 2} alerts and ${(safetyState.escalationCount || 0)} escalation checks today.`,
      alertsCount: safetyState.alertsCount || 2,
      escalationCount: safetyState.escalationCount || 0,
      actionsCount: Math.max(1, (safetyState.responders || []).length - 1),
      responders: safetyState.responders || [primaryParent],
      outcome: safetyState.outcome || 'Recovery was monitored and the household stayed covered through the day.',
    },
    reviewSummary,
    dailyHistory: sessions.map((session) => ({
      id: session.id,
      headline: session.headline,
      dateLabel: session.dateLabel,
      outcome: session.outcome,
      alertsCount: session.alertsCount || 0,
      actionsCount: session.actionsCount || Math.max(1, (session.responders || []).length - 1),
      escalationCount: session.escalationCount || 0,
      responders: session.responders || [],
      timeline: session.timeline || [],
      review: session.review || reviewSummary,
    })),
    selectedSession: sessions[0]
      ? {
          ...sessions[0],
          actionsCount: sessions[0].actionsCount || Math.max(1, (sessions[0].responders || []).length - 1),
          review: sessions[0].review || reviewSummary,
        }
      : null,
    quickActions: actionSetByRole(user.role, household),
    nutrition: buildNutritionPayload(household, currentState),
  };
};

export const buildWorkspacePayloadForRequest = (req, user, household = null) =>
  localizeWorkspacePayload(requestLang(req), buildWorkspacePayload(user, household));

export const readOpenApiSpec = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return fs.readFile(path.join(__dirname, '..', '..', 'docs', 'openapi.yaml'), 'utf8');
};
