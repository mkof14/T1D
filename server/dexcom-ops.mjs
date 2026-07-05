export const ensureDexcomOps = (household) => {
  const ops = household.dexcomOps || {};
  return {
    auditTrail: Array.isArray(ops.auditTrail) ? ops.auditTrail.slice(0, 24) : [],
    lastSuccessAt: ops.lastSuccessAt || '',
    lastFailureAt: ops.lastFailureAt || '',
    consecutiveFailures: Number.isFinite(Number(ops.consecutiveFailures)) ? Number(ops.consecutiveFailures) : 0,
    workerState: ops.workerState || 'idle',
    nextWorkerRunAt: ops.nextWorkerRunAt || '',
    lastWorkerRunAt: ops.lastWorkerRunAt || '',
    pausedUntil: ops.pausedUntil || '',
  };
};
