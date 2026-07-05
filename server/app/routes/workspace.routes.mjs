import {
  actionForDone,
  applySafetyAction,
  currentStateForRole,
  ensureSafetyState,
  operatingMode,
} from '../../state-machine.mjs';
import { ensureDexcomConnection } from '../../dexcom-service.mjs';
import { analyzeMealInput, appendMealToHousehold } from '../../nutrition-service.mjs';
import { appendAuditEvent } from '../../audit-log.mjs';

export const handleWorkspaceRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    sendJson,
    readBody,
    findSessionUser,
    readHouseholds,
    writeHouseholds,
    safeText,
    normalizeDiabetesType,
    buildWorkspacePayloadForRequest,
    readJson,
    writeJson,
    DATA_DIR,
    SUPPORT_ACTIONS,
  } = ctx;

  if (req.method === 'POST' && url.pathname === '/api/nutrition/analyze') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid request body' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const household = households[householdIndex];
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.replace(/^data:image\/\w+;base64,/, '') : '';
    const note = safeText(body.note, 200);
    if (!imageBase64 && !note) {
      sendJson(res, 400, { error: 'Add a photo or short description of the meal' });
      return true;
    }

    const safetyState = ensureSafetyState(household);
    const currentStateBase = currentStateForRole(current.user.role, household, safetyState, current.user);
    const dexcom = ensureDexcomConnection(household);

    let meal;
    try {
      meal = analyzeMealInput({
        imageBase64,
        note,
        diabetesType: normalizeDiabetesType(household.diabetesType),
        currentGlucose: dexcom.latestGlucose ?? currentStateBase.glucose,
        trend: dexcom.latestTrend || currentStateBase.trend || 'flat',
      });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Could not analyze meal' });
      return true;
    }

    const nextHousehold = appendMealToHousehold(household, meal, current.user);
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    await appendAuditEvent(readJson, writeJson, DATA_DIR, {
      kind: 'nutrition_analyze',
      userId: current.user.id,
      householdId: household.id,
      mealId: meal.id,
      carbs: meal.macros.carbs,
    });
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  if (req.method === 'POST' && (url.pathname === '/api/action' || url.pathname === '/api/night-action')) {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object' || !body.action) {
      sendJson(res, 400, { error: 'Action is required' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const household = households[householdIndex];
    const requestedAction = safeText(body.action, 80);
    const normalizedAction =
      requestedAction === 'DONE'
        ? actionForDone(current.user.role, operatingMode(), household)
        : SUPPORT_ACTIONS.has(requestedAction)
          ? requestedAction
          : '';
    if (!normalizedAction) {
      sendJson(res, 400, { error: 'Unsupported action' });
      return true;
    }
    const nextSafetyState = applySafetyAction(current.user, household, normalizedAction);
    const nextHousehold = {
      ...household,
      safetyState: nextSafetyState,
      updatedAt: new Date().toISOString(),
    };
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    await appendAuditEvent(readJson, writeJson, DATA_DIR, {
      kind: 'safety_action',
      userId: current.user.id,
      householdId: household.id,
      action: normalizedAction,
      stage: nextSafetyState.stage,
    });
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  return false;
};
