import {
  createNotification,
  dispatchNotification,
  queueInAppNotification,
  transitionDelivery,
} from './notification-service.mjs';
import { dualWriteNotificationDelivery } from '../infrastructure/repositories/dual-write-service.mjs';

const EXTERNAL_CHANNELS = Object.freeze(['push', 'sms']);

const persistDelivery = (delivery) => {
  if (!delivery) return;
  void dualWriteNotificationDelivery(delivery).then((result) => {
    if (!result.ok && !result.skipped) {
      console.warn('[t1d-api] notification dual-write failed', result.error);
    }
  });
};

const deliverQueued = async (record) => {
  const delivered = await dispatchNotification(record.id);
  persistDelivery(delivered);
  return delivered;
};

export const orchestrateAlertCreated = async ({
  householdId,
  alertId,
  primaryContact,
  payload = {},
}) => {
  const deliveries = [];

  const inApp = queueInAppNotification({
    householdId,
    alertId,
    recipientRole: primaryContact?.role || 'parent',
    recipientName: primaryContact?.name || 'Primary contact',
    payload: { kind: 'alert_created', ...payload },
  });
  deliveries.push(await deliverQueued(inApp));

  for (const channel of EXTERNAL_CHANNELS) {
    const created = createNotification({
      householdId,
      alertId,
      channel,
      recipientRole: primaryContact?.role || 'parent',
      recipientName: primaryContact?.name || 'Primary contact',
      payload: { kind: 'alert_created', channel, ...payload },
    });
    const queued = transitionDelivery(created.id, 'queued');
    deliveries.push(await deliverQueued(queued));
  }

  return deliveries;
};

export const orchestrateEscalation = async ({
  householdId,
  alertId,
  fromRole,
  target,
  payload = {},
}) => {
  const deliveries = [];

  const inApp = queueInAppNotification({
    householdId,
    alertId,
    recipientRole: target?.role || 'caregiver',
    recipientName: target?.name || 'Caregiver',
    payload: { kind: 'escalation', fromRole, ...payload },
  });
  deliveries.push(await deliverQueued(inApp));

  for (const channel of EXTERNAL_CHANNELS) {
    const created = createNotification({
      householdId,
      alertId,
      channel,
      recipientRole: target?.role || 'caregiver',
      recipientName: target?.name || 'Caregiver',
      payload: { kind: 'escalation', channel, fromRole, ...payload },
    });
    const queued = transitionDelivery(created.id, 'queued');
    deliveries.push(await deliverQueued(queued));
  }

  return deliveries;
};

export const orchestrateResponderAction = async ({
  householdId,
  alertId,
  user,
  action,
}) => {
  const inApp = queueInAppNotification({
    householdId,
    alertId,
    recipientRole: user?.role || 'parent',
    recipientName: user?.fullName || user?.email || 'Responder',
    payload: { kind: action },
  });
  const delivered = await deliverQueued(inApp);
  return [delivered];
};
