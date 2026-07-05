export const createHouseholdStorage = ({
  readJson,
  writeJson,
  HOUSEHOLDS_FILE,
  ensureSafetyState,
  normalizeDiabetesType,
  sealDexcomTokens,
  ensureDexcomConnection,
  dualWriteDexcomConnection,
}) => {
  const normalizeHouseholdRecord = (household) => {
    if (!household || typeof household !== 'object') return household;
    const safetyState = ensureSafetyState(household);
    const { nightState: _legacyNightState, ...rest } = household;
    const sealedDexcom = rest.dexcom ? sealDexcomTokens(ensureDexcomConnection({ dexcom: rest.dexcom })) : rest.dexcom;
    return {
      ...rest,
      diabetesType: normalizeDiabetesType(rest.diabetesType),
      safetyState,
      dexcom: sealedDexcom,
    };
  };

  const readHouseholds = async () => {
    const data = await readJson(HOUSEHOLDS_FILE, { households: [] });
    return Array.isArray(data.households) ? data.households.map(normalizeHouseholdRecord) : [];
  };

  const writeHouseholds = async (households) =>
    writeJson(HOUSEHOLDS_FILE, { households: households.map(normalizeHouseholdRecord) });

  const mirrorHouseholdToSql = (household) => {
    void dualWriteDexcomConnection(household).then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn('[t1d-api] household/dexcom dual-write failed', result.error);
      }
    });
  };

  const persistHouseholdUpdate = async (households, householdIndex, nextHousehold) => {
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    mirrorHouseholdToSql(nextHousehold);
    return nextHousehold;
  };

  const persistHouseholdRecord = async (households, nextHousehold) => {
    const index = households.findIndex((entry) => entry.id === nextHousehold.id);
    if (index === -1) {
      households.push(nextHousehold);
      await writeHouseholds(households);
      mirrorHouseholdToSql(nextHousehold);
      return nextHousehold;
    }
    return persistHouseholdUpdate(households, index, nextHousehold);
  };

  return {
    readHouseholds,
    writeHouseholds,
    normalizeHouseholdRecord,
    mirrorHouseholdToSql,
    persistHouseholdUpdate,
    persistHouseholdRecord,
  };
};
