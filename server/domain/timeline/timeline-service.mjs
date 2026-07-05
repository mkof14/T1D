import { ensureDexcomConnection } from '../../dexcom-service.mjs';
import { mapStageToResponderState } from '../safety/responder-ownership.mjs';
import { buildWatchdogSnapshot } from '../glucose/reading-freshness.mjs';
import { normalizeReading, dedupeReadings } from '../glucose/glucose-normalizer.mjs';
import { ALERT_RULE_VERSION } from '../alerts/alert-rules.mjs';

const toIso = (value) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
};

export const buildPatientTimeline = (household) => {
  const dexcom = ensureDexcomConnection(household);
  const safetyState = household.safetyState || {};
  const eventLog = Array.isArray(safetyState.eventLog) ? safetyState.eventLog : [];
  const readings = dedupeReadings(
    (Array.isArray(dexcom.readings) ? dexcom.readings : [])
      .map((reading) => normalizeReading(reading))
      .filter(Boolean)
  );

  const readingEntries = readings.map((reading) => ({
    id: reading.id,
    type: 'glucose_reading',
    timestamp: reading.timestamp,
    title: `Glucose ${reading.glucoseMgDl} mg/dL`,
    detail: `Trend: ${reading.trend}`,
    meta: { source: reading.source },
  }));

  const logEntries = eventLog.map((entry) => ({
    id: entry.id,
    type: entry.kind || 'event',
    timestamp: toIso(entry.time),
    title: entry.step || entry.kind || 'Event',
    detail: entry.detail || '',
    status: entry.status || 'unknown',
    actor: entry.actor || '',
    alertId: entry.alertId || (entry.kind === 'alert' ? entry.id : undefined),
  }));

  const systemWarnings = [];
  const watchdog = buildWatchdogSnapshot(household);
  if (watchdog.staleDataFlag) {
    systemWarnings.push({
      id: 'stale-data-warning',
      type: 'system_warning',
      timestamp: new Date().toISOString(),
      title: 'Stale CGM data',
      detail: 'Do not treat glucose as current until fresher readings arrive.',
    });
  }

  const entries = [...readingEntries, ...logEntries, ...systemWarnings].sort(
    (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
  );

  return {
    patientId: household.id,
    householdId: household.id,
    childName: household.childName || '',
    ruleVersion: ALERT_RULE_VERSION,
    responderState: mapStageToResponderState(safetyState),
    watchdog,
    entries,
  };
};

export const buildAlertTimeline = (household, alertId) => {
  const timeline = buildPatientTimeline(household);
  const alert = timeline.entries.find((entry) => entry.id === alertId && entry.type === 'alert');
  if (!alert) return null;
  const related = timeline.entries.filter(
    (entry) => entry.alertId === alertId || entry.id === alertId
  );
  return {
    alertId,
    alert,
    related,
    responderState: timeline.responderState,
    ruleVersion: ALERT_RULE_VERSION,
  };
};

export const findActiveAlertId = (household) => {
  const log = Array.isArray(household?.safetyState?.eventLog) ? household.safetyState.eventLog : [];
  const active = log.find((entry) => entry.kind === 'alert' && entry.status === 'active');
  return active?.id || null;
};
