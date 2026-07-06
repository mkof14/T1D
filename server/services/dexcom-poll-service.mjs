export const createDexcomPollService = ({
  randomBytes,
  ensureDexcomOps,
  ensureDexcomConnection,
  dexcomEnvConfig,
  pollDexcom,
  pollDexcomLive,
  applyAlertEvaluation,
  dualWritePollReadings,
  dualWriteDexcomConnection,
  dualWriteAlertCreated,
  orchestrateAlertCreated,
  t,
  readHouseholds,
  writeHouseholds,
}) => {
  const appendDexcomAudit = (household, event) => {
    const ops = ensureDexcomOps(household);
    return {
      ...household,
      dexcomOps: {
        ...ops,
        auditTrail: [
          {
            id: randomBytes(6).toString('hex'),
            time: new Date().toISOString(),
            ...event,
          },
          ...ops.auditTrail,
        ].slice(0, 24),
        lastSuccessAt: event.status === 'ok' ? new Date().toISOString() : ops.lastSuccessAt,
        lastFailureAt: event.status === 'error' ? new Date().toISOString() : ops.lastFailureAt,
        consecutiveFailures: event.status === 'ok' ? 0 : event.status === 'error' ? ops.consecutiveFailures + 1 : ops.consecutiveFailures,
        workerState: ops.workerState,
        nextWorkerRunAt: ops.nextWorkerRunAt,
        lastWorkerRunAt: ops.lastWorkerRunAt,
        pausedUntil: ops.pausedUntil,
      },
    };
  };

  const shouldRunBackgroundDexcomPoll = (household) => {
    const dexcom = ensureDexcomConnection(household);
    if (!dexcom || (dexcom.status !== 'connected' && dexcom.status !== 'error')) return false;
    if (!dexcom.nextPollDueAt) return false;
    const dueAt = Date.parse(dexcom.nextPollDueAt);
    return Number.isFinite(dueAt) && dueAt <= Date.now();
  };

  const applyDexcomPollToHousehold = async (household, source = 'manual') => {
    const previousReadings = ensureDexcomConnection(household).readings || [];
    const nextDexcom = dexcomEnvConfig().useLiveMode
      ? await pollDexcomLive(household)
      : pollDexcom(household);

    const polledHousehold = appendDexcomAudit({
      ...household,
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: nextDexcom.status === 'error' ? 'error' : 'poll',
      status: nextDexcom.status === 'error' ? 'error' : nextDexcom.requestHealth === 'retrying' || nextDexcom.dataFreshness !== 'live' ? 'warning' : 'ok',
      headline: nextDexcom.status === 'error'
        ? t('en', 'dexcomPollFailed', source)
        : t('en', 'dexcomPollCompleted', source),
      detail: nextDexcom.message,
    });

    const { household: alertedHousehold, alertCreated, decision } = applyAlertEvaluation(polledHousehold);
    const dualWriteResult = await dualWritePollReadings(
      alertedHousehold,
      previousReadings,
      ensureDexcomConnection(alertedHousehold).readings || [],
    );
    if (!dualWriteResult.ok && !dualWriteResult.skipped) {
      console.warn('[t1d-api] glucose dual-write failed', dualWriteResult.error);
    }
    const dexcomWriteResult = await dualWriteDexcomConnection(alertedHousehold);
    if (!dexcomWriteResult.ok && !dexcomWriteResult.skipped) {
      console.warn('[t1d-api] dexcom dual-write failed', dexcomWriteResult.error);
    }
    if (alertCreated) {
      const alertWriteResult = await dualWriteAlertCreated(alertedHousehold, alertCreated, decision);
      if (!alertWriteResult.ok && !alertWriteResult.skipped) {
        console.warn('[t1d-api] alert dual-write failed', alertWriteResult.error);
      }
      if (orchestrateAlertCreated) {
        const primaryContact = alertedHousehold.safetyState?.responderOwnership || {};
        void orchestrateAlertCreated({
          householdId: alertedHousehold.id,
          alertId: alertCreated.id,
          primaryContact: {
            role: primaryContact.primaryRole || 'parent',
            name: primaryContact.primaryName || 'Primary contact',
          },
          payload: {
            level: alertCreated.level,
            reason: alertCreated.reason,
          },
        });
      }
    }
    return alertedHousehold;
  };

  const runBackgroundDexcomSync = async () => {
    const households = await readHouseholds();
    let changed = false;
    const nextHouseholds = await Promise.all(
      households.map(async (household) => {
        if (!shouldRunBackgroundDexcomPoll(household)) return household;
        changed = true;
        return applyDexcomPollToHousehold(household, 'background');
      })
    );
    if (changed) {
      await writeHouseholds(nextHouseholds);
    }
    return { processed: nextHouseholds.length, changed };
  };

  return {
    appendDexcomAudit,
    shouldRunBackgroundDexcomPoll,
    applyDexcomPollToHousehold,
    runBackgroundDexcomSync,
  };
};
