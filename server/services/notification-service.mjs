import { randomBytes } from 'node:crypto';

export const DELIVERY_STATES = Object.freeze([
  'created',
  'queued',
  'sent',
  'provider_accepted',
  'delivered',
  'opened',
  'acknowledged',
  'failed',
  'expired',
  'escalated',
]);

export const CHANNELS = Object.freeze(['in_app', 'push', 'sms', 'email', 'voice']);

const deliveries = new Map();

export const createNotification = ({
  householdId,
  alertId,
  channel = 'in_app',
  recipientRole,
  recipientName,
  payload = {},
}) => {
  const id = randomBytes(8).toString('hex');
  const record = {
    id,
    householdId,
    alertId,
    channel,
    recipientRole,
    recipientName,
    state: 'created',
    payload,
    attempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [{ state: 'created', at: new Date().toISOString() }],
  };
  deliveries.set(id, record);
  return record;
};

export const transitionDelivery = (deliveryId, nextState, meta = {}) => {
  const record = deliveries.get(deliveryId);
  if (!record) return null;
  if (!DELIVERY_STATES.includes(nextState)) return null;
  const updated = {
    ...record,
    state: nextState,
    updatedAt: new Date().toISOString(),
    attempts: nextState === 'failed' ? record.attempts + 1 : record.attempts,
    history: [...record.history, { state: nextState, at: new Date().toISOString(), ...meta }],
  };
  deliveries.set(deliveryId, updated);
  return updated;
};

export const queueInAppNotification = (params) => {
  const created = createNotification({ ...params, channel: 'in_app' });
  return transitionDelivery(created.id, 'queued');
};

/** Placeholder providers — do not claim delivery without provider confirmation. */
export const dispatchNotification = async (deliveryId) => {
  const record = deliveries.get(deliveryId);
  if (!record) return null;
  if (record.channel === 'in_app') {
    return transitionDelivery(deliveryId, 'delivered', { provider: 'in_app' });
  }
  return transitionDelivery(deliveryId, 'queued', { provider: 'placeholder', note: 'External provider not connected' });
};

export const listDeliveriesForHousehold = (householdId) =>
  [...deliveries.values()].filter((entry) => entry.householdId === householdId);

export const resetNotificationStore = () => {
  deliveries.clear();
};
