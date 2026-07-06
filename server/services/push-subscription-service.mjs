import { randomBytes } from 'node:crypto';
import { getPool } from '../infrastructure/db.mjs';
import {
  deletePushSubscriptionRow,
  upsertPushSubscriptionRow,
} from '../infrastructure/repositories/push-subscription-repository.mjs';

let readJson = async () => ({ subscriptions: [] });
let writeJson = async () => {};
let subscriptionsFile = '';

export const configurePushSubscriptionStorage = ({ readJsonFn, writeJsonFn, filePath }) => {
  readJson = readJsonFn;
  writeJson = writeJsonFn;
  subscriptionsFile = filePath;
};

const normalizeRecord = (record) => {
  if (!record || typeof record !== 'object') return null;
  const endpoint = String(record.endpoint || '').trim();
  const p256dh = String(record.keys?.p256dh || record.p256dh || '').trim();
  const auth = String(record.keys?.auth || record.auth || record.authKey || '').trim();
  if (!endpoint || !p256dh || !auth) return null;

  return {
    id: String(record.id || randomBytes(8).toString('hex')),
    userId: String(record.userId || ''),
    householdId: String(record.householdId || ''),
    userRole: String(record.userRole || 'parent'),
    endpoint,
    keys: { p256dh, auth },
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const readAll = async () => {
  const payload = await readJson(subscriptionsFile, { subscriptions: [] });
  const subscriptions = Array.isArray(payload.subscriptions) ? payload.subscriptions : [];
  return subscriptions.map(normalizeRecord).filter(Boolean);
};

const writeAll = async (subscriptions) => {
  await writeJson(subscriptionsFile, { subscriptions });
};

const mirrorToSql = async (subscription) => {
  const pool = await getPool();
  if (!pool) return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };

  try {
    return await upsertPushSubscriptionRow(pool, subscription);
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'push_subscription_dual_write_failed' };
  } finally {
    await pool.end();
  }
};

const removeFromSql = async (endpoint) => {
  const pool = await getPool();
  if (!pool) return { ok: false, skipped: true, reason: 'DATABASE_URL not set' };

  try {
    return await deletePushSubscriptionRow(pool, endpoint);
  } catch (error) {
    return { ok: false, skipped: false, error: error?.message || 'push_subscription_delete_failed' };
  } finally {
    await pool.end();
  }
};

export const upsertPushSubscription = async ({ user, subscription }) => {
  if (!user?.id || !user?.householdId) {
    return { ok: false, error: 'household_required' };
  }

  const normalized = normalizeRecord({
    ...subscription,
    userId: user.id,
    householdId: user.householdId,
    userRole: user.role || 'parent',
  });
  if (!normalized) {
    return { ok: false, error: 'invalid_subscription' };
  }

  const subscriptions = await readAll();
  const withoutEndpoint = subscriptions.filter((entry) => entry.endpoint !== normalized.endpoint);
  withoutEndpoint.push(normalized);
  await writeAll(withoutEndpoint);
  void mirrorToSql(normalized);
  return { ok: true, subscription: normalized };
};

export const removePushSubscription = async ({ user, endpoint }) => {
  const trimmed = String(endpoint || '').trim();
  if (!trimmed) {
    return { ok: false, error: 'endpoint_required' };
  }

  const subscriptions = await readAll();
  const existing = subscriptions.find((entry) => entry.endpoint === trimmed);
  if (!existing) {
    return { ok: true, removed: false };
  }
  if (user?.id && existing.userId !== user.id) {
    return { ok: false, error: 'forbidden' };
  }

  await writeAll(subscriptions.filter((entry) => entry.endpoint !== trimmed));
  void removeFromSql(trimmed);
  return { ok: true, removed: true };
};

export const listPushSubscriptionsForUser = async (userId) => {
  if (!userId) return [];
  return (await readAll()).filter((entry) => entry.userId === userId);
};

export const listPushSubscriptionsForDelivery = async (delivery) => {
  if (!delivery?.householdId || !delivery?.recipientRole) return [];
  return (await readAll()).filter(
    (entry) =>
      entry.householdId === delivery.householdId
      && entry.userRole === delivery.recipientRole,
  );
};

export const resetPushSubscriptionStore = async () => {
  await writeAll([]);
};
