import { describe, expect, it } from 'vitest';
import { isPushConfigured, isSmsConfigured, sendPushNotification, sendSmsNotification } from '../../server/services/push-provider.mjs';

describe('push-provider', () => {
  it('reports providers as not configured by default', () => {
    delete process.env.T1D_VAPID_PUBLIC_KEY;
    delete process.env.T1D_VAPID_PRIVATE_KEY;
    delete process.env.T1D_TWILIO_ACCOUNT_SID;
    expect(isPushConfigured()).toBe(false);
    expect(isSmsConfigured()).toBe(false);
  });

  it('queues push when vapid keys exist but subscriptions are missing', async () => {
    process.env.T1D_VAPID_PUBLIC_KEY = 'test-public';
    process.env.T1D_VAPID_PRIVATE_KEY = 'test-private';
    const result = await sendPushNotification({ id: 'd1', channel: 'push' });
    expect(result.ok).toBe(false);
    expect(result.state).toBe('queued');
    delete process.env.T1D_VAPID_PUBLIC_KEY;
    delete process.env.T1D_VAPID_PRIVATE_KEY;
  });

  it('queues sms when twilio exists but routing is missing', async () => {
    process.env.T1D_TWILIO_ACCOUNT_SID = 'sid';
    process.env.T1D_TWILIO_AUTH_TOKEN = 'token';
    process.env.T1D_TWILIO_FROM_NUMBER = '+10000000000';
    const result = await sendSmsNotification({ id: 'd2', channel: 'sms' });
    expect(result.ok).toBe(false);
    expect(result.state).toBe('queued');
    delete process.env.T1D_TWILIO_ACCOUNT_SID;
    delete process.env.T1D_TWILIO_AUTH_TOKEN;
    delete process.env.T1D_TWILIO_FROM_NUMBER;
  });
});
