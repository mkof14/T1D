import {
  acknowledgeAlert,
  resolveAlert,
  takeOwnership,
} from '../../domain/safety/responder-ownership.mjs';
import {
  buildAlertTimeline,
  buildPatientTimeline,
  findActiveAlertId,
} from '../../domain/timeline/timeline-service.mjs';
import { queueInAppNotification } from '../../services/notification-service.mjs';
import { dualWriteAlertResponderAction } from '../../infrastructure/repositories/dual-write-service.mjs';

export const handleAlertTimelineRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    findSessionUser,
    readHouseholds,
    persistHouseholdUpdate,
    sendJson,
    readBody,
    BODY_TOO_LARGE,
  } = ctx;
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname.startsWith('/api/timeline/')) {
    const patientId = pathname.slice('/api/timeline/'.length).split('/')[0];
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }
    const households = await readHouseholds();
    const household = households.find((entry) => entry.id === current.user.householdId || entry.id === patientId);
    if (!household) {
      sendJson(res, 404, { error: 'Household not found' });
      return true;
    }
    sendJson(res, 200, buildPatientTimeline(household));
    return true;
  }

  if (req.method === 'GET' && pathname.startsWith('/api/alerts/') && pathname.endsWith('/timeline')) {
    const alertId = pathname.split('/')[3];
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }
    const households = await readHouseholds();
    const household = households.find((entry) => entry.id === current.user.householdId);
    if (!household) {
      sendJson(res, 404, { error: 'Household not found' });
      return true;
    }
    const timeline = buildAlertTimeline(household, alertId);
    if (!timeline) {
      sendJson(res, 404, { error: 'Alert not found' });
      return true;
    }
    sendJson(res, 200, timeline);
    return true;
  }

  const mutationMatch = pathname.match(/^\/api\/alerts\/([^/]+)\/(acknowledge|take-ownership|resolve)$/);
  if (req.method === 'POST' && mutationMatch) {
    const [, alertId, action] = mutationMatch;
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (body === BODY_TOO_LARGE) {
      sendJson(res, 413, { error: 'Request body too large' });
      return true;
    }

    const resolvedAlertId = body?.alertId || alertId || findActiveAlertId(
      (await readHouseholds()).find((entry) => entry.id === current.user.householdId) || {}
    );

    const households = await readHouseholds();
    const index = households.findIndex((entry) => entry.id === current.user.householdId);
    if (index === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const household = households[index];
    let result;
    if (action === 'acknowledge') {
      result = acknowledgeAlert(household, current.user, resolvedAlertId);
    } else if (action === 'take-ownership') {
      result = takeOwnership(household, current.user, resolvedAlertId);
    } else {
      result = resolveAlert(household, current.user, resolvedAlertId);
    }

    if (!result.ok) {
      sendJson(res, 409, { error: result.error });
      return true;
    }

    if (action === 'acknowledge') {
      queueInAppNotification({
        householdId: household.id,
        alertId: resolvedAlertId,
        recipientRole: current.user.role,
        recipientName: current.user.fullName || current.user.email,
        payload: { kind: 'acknowledgement' },
      });
    }

    const nextHousehold = {
      ...household,
      safetyState: result.safetyState,
      updatedAt: new Date().toISOString(),
    };
    await persistHouseholdUpdate(households, index, nextHousehold);
    void dualWriteAlertResponderAction({
      household: nextHousehold,
      user: current.user,
      action,
      alertId: resolvedAlertId,
    }).then((result) => {
      if (!result.ok && !result.skipped) {
        console.warn('[t1d-api] alert action dual-write failed', result.error);
      }
    });
    sendJson(res, 200, {
      ok: true,
      alertId: resolvedAlertId,
      responderState: result.safetyState.responderOwnership?.state,
      timeline: buildAlertTimeline(nextHousehold, resolvedAlertId),
    });
    return true;
  }

  return false;
};
