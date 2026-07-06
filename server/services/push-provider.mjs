import webpush from 'web-push';
import { listPushSubscriptionsForDelivery } from './push-subscription-service.mjs';

let readHouseholdsFn = async () => [];

export const configurePushProvider = ({ readHouseholds }) => {
  if (typeof readHouseholds === 'function') {
    readHouseholdsFn = readHouseholds;
  }
};

export const getVapidPublicKey = () => String(process.env.T1D_VAPID_PUBLIC_KEY || '').trim();

export const getVapidSubject = () =>
  String(process.env.T1D_VAPID_SUBJECT || process.env.T1D_SITE_URL || 'mailto:ops@t1d.local').trim();

export const isPushConfigured = () =>
  Boolean(getVapidPublicKey() && String(process.env.T1D_VAPID_PRIVATE_KEY || '').trim());

export const isSmsConfigured = () =>
  Boolean(
    String(process.env.T1D_TWILIO_ACCOUNT_SID || '').trim()
    && String(process.env.T1D_TWILIO_AUTH_TOKEN || '').trim()
    && String(process.env.T1D_TWILIO_FROM_NUMBER || '').trim(),
  );

const buildPushPayload = (delivery) => {
  const kind = delivery?.payload?.kind || 'alert';
  const title =
    kind === 'escalation'
      ? 'Steady — backup needed'
      : 'Steady — safety alert';
  const body =
    delivery?.payload?.detail
    || `${delivery?.recipientName || 'Contact'}: ${kind.replace(/_/g, ' ')}`;
  return JSON.stringify({
    title,
    body,
    kind,
    alertId: delivery?.alertId || null,
    householdId: delivery?.householdId || null,
  });
};

const resolveContactPhone = async (delivery) => {
  const households = await readHouseholdsFn();
  const household = households.find((entry) => entry.id === delivery?.householdId);
  const phones = household?.safetyPreferences?.contactPhones || {};
  const role = delivery?.recipientRole;
  const phone = role ? phones[role] : '';
  const trimmed = String(phone || '').trim();
  return trimmed.startsWith('+') ? trimmed : '';
};

const sendTwilioSms = async ({ to, body }) => {
  const accountSid = String(process.env.T1D_TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.T1D_TWILIO_AUTH_TOKEN || '').trim();
  const from = String(process.env.T1D_TWILIO_FROM_NUMBER || '').trim();
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      provider: 'twilio',
      state: 'failed',
      note: data?.message || `Twilio error ${response.status}`,
    };
  }

  return {
    ok: true,
    provider: 'twilio',
    state: 'sent',
    providerId: data?.sid || null,
  };
};

export const sendPushNotification = async (delivery) => {
  if (!isPushConfigured()) {
    return {
      ok: false,
      provider: 'push',
      state: 'queued',
      note: 'VAPID keys not configured',
    };
  }

  const subscriptions = await listPushSubscriptionsForDelivery(delivery);
  if (subscriptions.length === 0) {
    return {
      ok: false,
      provider: 'push',
      state: 'queued',
      note: 'No device subscriptions for recipient role',
    };
  }

  webpush.setVapidDetails(
    getVapidSubject(),
    getVapidPublicKey(),
    String(process.env.T1D_VAPID_PRIVATE_KEY || '').trim(),
  );

  const payload = buildPushPayload(delivery);
  let sent = 0;
  let lastError = '';

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        payload,
      );
      sent += 1;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'push_send_failed';
    }
  }

  if (sent > 0) {
    return {
      ok: true,
      provider: 'push',
      state: 'sent',
      deliveredCount: sent,
      attemptedCount: subscriptions.length,
    };
  }

  return {
    ok: false,
    provider: 'push',
    state: 'failed',
    note: lastError || 'Push delivery failed',
  };
};

export const sendSmsNotification = async (delivery) => {
  if (!isSmsConfigured()) {
    return {
      ok: false,
      provider: 'sms',
      state: 'queued',
      note: 'Twilio credentials not configured',
    };
  }

  const phone = await resolveContactPhone(delivery);
  if (!phone) {
    return {
      ok: false,
      provider: 'sms',
      state: 'queued',
      note: 'No SMS phone configured for recipient role',
    };
  }

  const kind = delivery?.payload?.kind || 'alert';
  const body =
    kind === 'escalation'
      ? `Steady backup alert for ${delivery?.recipientName || 'caregiver'}. Open the app to respond.`
      : `Steady safety alert for ${delivery?.recipientName || 'contact'}. Open the app to respond.`;

  return sendTwilioSms({ to: phone, body });
};
