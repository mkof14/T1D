import {
  listPushSubscriptionsForUser,
  removePushSubscription,
  upsertPushSubscription,
} from '../../services/push-subscription-service.mjs';
import { getVapidPublicKey, isPushConfigured } from '../../services/push-provider.mjs';

export const handlePushRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    sendJson,
    readBody,
    findSessionUser,
  } = ctx;

  if (!url.pathname.startsWith('/api/push/')) {
    return false;
  }

  if (req.method === 'GET' && url.pathname === '/api/push/config') {
    const current = await findSessionUser(req);
    const subscriptions = current?.user?.id
      ? await listPushSubscriptionsForUser(current.user.id)
      : [];

    sendJson(res, 200, {
      enabled: isPushConfigured(),
      publicKey: getVapidPublicKey(),
      subscribed: subscriptions.length > 0,
      subscriptionCount: subscriptions.length,
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/push/subscribe') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }
    if (!current.user.householdId) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }
    if (!isPushConfigured()) {
      sendJson(res, 503, { error: 'Push notifications are not configured' });
      return true;
    }

    const body = await readBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }

    const result = await upsertPushSubscription({
      user: current.user,
      subscription: body,
    });
    if (!result.ok) {
      sendJson(res, 400, { error: result.error || 'subscribe_failed' });
      return true;
    }

    sendJson(res, 200, { ok: true, subscriptionId: result.subscription.id });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/push/unsubscribe') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    const endpoint = typeof body?.endpoint === 'string' ? body.endpoint : '';
    const result = await removePushSubscription({ user: current.user, endpoint });
    if (!result.ok) {
      sendJson(res, result.error === 'forbidden' ? 403 : 400, { error: result.error || 'unsubscribe_failed' });
      return true;
    }

    sendJson(res, 200, { ok: true, removed: result.removed });
    return true;
  }

  sendJson(res, 404, { error: 'Not found' });
  return true;
};
