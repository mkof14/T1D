export const startDexcomSyncWorker = ({
  intervalMs,
  readHouseholds,
  writeHouseholds,
  shouldRunBackgroundDexcomPoll,
  applyDexcomPollToHousehold,
  appendDexcomAudit,
  logger = console,
}) => {
  let inFlight = false;
  const nowIso = () => new Date().toISOString();
  const parseIso = (value) => {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : NaN;
  };
  const withWorkerState = (household, patch) => ({
    ...household,
    dexcomOps: {
      ...(household.dexcomOps || {}),
      workerState: 'idle',
      nextWorkerRunAt: '',
      lastWorkerRunAt: '',
      pausedUntil: '',
      ...patch,
    },
  });

  const run = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      const households = await readHouseholds();
      let changed = false;
      const nextHouseholds = [];

      for (const household of households) {
        const activeHousehold = withWorkerState(household, { lastWorkerRunAt: nowIso() });
        const pausedUntilMs = parseIso(activeHousehold.dexcomOps?.pausedUntil);
        if (Number.isFinite(pausedUntilMs) && pausedUntilMs > Date.now()) {
          nextHouseholds.push(withWorkerState(activeHousehold, {
            workerState: 'paused',
            nextWorkerRunAt: activeHousehold.dexcom?.nextPollDueAt || '',
          }));
          continue;
        }
        if (!shouldRunBackgroundDexcomPoll(household)) {
          nextHouseholds.push(withWorkerState(activeHousehold, {
            workerState: 'scheduled',
            pausedUntil: '',
          }));
          continue;
        }

        try {
          const nextHousehold = await applyDexcomPollToHousehold(withWorkerState(activeHousehold, { workerState: 'running' }), 'background');
          const pauseUntil = nextHousehold.dexcom?.requestHealth === 'rate_limited'
            ? (nextHousehold.dexcom?.rateLimitResetAt || nextHousehold.dexcom?.nextPollDueAt || '')
            : nextHousehold.dexcom?.requestHealth === 'failed'
              ? (nextHousehold.dexcom?.nextPollDueAt || '')
              : '';
          nextHouseholds.push(withWorkerState(nextHousehold, {
            workerState: pauseUntil ? 'paused' : 'scheduled',
            nextWorkerRunAt: nextHousehold.dexcom?.nextPollDueAt || '',
            pausedUntil: pauseUntil,
          }));
          changed = true;
        } catch (error) {
          nextHouseholds.push(withWorkerState(appendDexcomAudit({
            ...activeHousehold,
            updatedAt: nowIso(),
          }, {
            kind: 'error',
            status: 'error',
            headline: 'Dexcom background sync failed',
            detail: error instanceof Error ? error.message : 'Background Dexcom sync failed unexpectedly.',
          }), {
            workerState: 'paused',
            pausedUntil: nowIso(),
          }));
          changed = true;
        }
      }

      if (changed) {
        await writeHouseholds(nextHouseholds);
      }
    } finally {
      inFlight = false;
    }
  };

  const timer = setInterval(() => {
    run().catch((error) => {
      logger.error('[t1d-api] background dexcom sync error', error);
    });
  }, Math.max(5000, intervalMs));

  return {
    run,
    stop: () => clearInterval(timer),
  };
};
