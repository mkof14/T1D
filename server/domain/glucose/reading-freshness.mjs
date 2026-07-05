import { ensureDexcomConnection } from '../../dexcom-service.mjs';

export const readingAgeMinutes = (dexcom) => {
  const connection = dexcom?.latestTimestamp !== undefined ? dexcom : ensureDexcomConnection({ dexcom });
  if (!connection.latestTimestamp) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.round((Date.now() - Date.parse(connection.latestTimestamp)) / 60000));
};

export const isStaleReading = (dexcom, maxAgeMinutes = 45) =>
  readingAgeMinutes(dexcom) > maxAgeMinutes
  || dexcom?.dataFreshness === 'offline'
  || dexcom?.dataFreshness === 'stale';

export const buildWatchdogSnapshot = (household) => {
  const dexcom = ensureDexcomConnection(household);
  const ops = household?.dexcomOps || {};
  return {
    lastSuccessfulSync: ops.lastSuccessAt || dexcom.lastSync || '',
    lastReadingTimestamp: dexcom.latestTimestamp || '',
    readingAgeMinutes: Number.isFinite(readingAgeMinutes(dexcom)) ? readingAgeMinutes(dexcom) : null,
    tokenStatus: dexcom.tokenStatus || 'missing',
    refreshFailureCount: ops.consecutiveFailures || 0,
    deviceConnectionStatus: dexcom.deviceRuntime || 'unknown',
    workerHeartbeat: ops.lastWorkerRunAt || '',
    staleDataFlag: isStaleReading(dexcom),
    workerState: ops.workerState || 'idle',
  };
};
