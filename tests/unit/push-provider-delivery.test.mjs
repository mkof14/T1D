import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  configurePushProvider,
  sendPushNotification,
  sendSmsNotification,
} from '../../server/services/push-provider.mjs';
import {
  configurePushSubscriptionStorage,
  resetPushSubscriptionStore,
  upsertPushSubscription,
} from '../../server/services/push-subscription-service.mjs';

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('push-provider delivery', () => {
  let dataDir;

  beforeEach(async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), 't1d-push-unit-'));
    const { createStorage } = await import('../../server/storage.mjs');
    const storage = createStorage({ dataDirectory: dataDir });
    const subscriptionsFile = path.join(dataDir, 'push-subscriptions.json');
    const householdsFile = path.join(dataDir, 'households.json');

    configurePushSubscriptionStorage({
      readJsonFn: storage.read,
      writeJsonFn: storage.write,
      filePath: subscriptionsFile,
    });

    configurePushProvider({
      readHouseholds: async () => {
        const payload = await storage.read(householdsFile, { households: [] });
        return payload.households || [];
      },
    });

    await storage.write(householdsFile, {
      households: [{
        id: 'hh-1',
        safetyPreferences: {
          contactPhones: { parent: '+14155550123', adult: '', caregiver: '' },
        },
      }],
    });
  });

  afterEach(async () => {
    await resetPushSubscriptionStore();
    rmSync(dataDir, { recursive: true, force: true });
    delete process.env.T1D_VAPID_PUBLIC_KEY;
    delete process.env.T1D_VAPID_PRIVATE_KEY;
    delete process.env.T1D_TWILIO_ACCOUNT_SID;
    delete process.env.T1D_TWILIO_AUTH_TOKEN;
    delete process.env.T1D_TWILIO_FROM_NUMBER;
  });

  it('delivers push when subscriptions exist', async () => {
    process.env.T1D_VAPID_PUBLIC_KEY = 'public-key';
    process.env.T1D_VAPID_PRIVATE_KEY = 'private-key';

    await upsertPushSubscription({
      user: { id: 'user-1', householdId: 'hh-1', role: 'parent' },
      subscription: {
        endpoint: 'https://push.example.test/subscription/1',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      },
    });

    const result = await sendPushNotification({
      id: 'd1',
      channel: 'push',
      householdId: 'hh-1',
      recipientRole: 'parent',
      recipientName: 'Anna',
      payload: { kind: 'alert_created' },
    });

    expect(result.ok).toBe(true);
    expect(result.state).toBe('sent');
    expect(result.deliveredCount).toBe(1);
  });

  it('sends sms when phone is configured', async () => {
    process.env.T1D_TWILIO_ACCOUNT_SID = 'sid';
    process.env.T1D_TWILIO_AUTH_TOKEN = 'token';
    process.env.T1D_TWILIO_FROM_NUMBER = '+10000000000';

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ sid: 'SM123' }),
    });

    const result = await sendSmsNotification({
      id: 'd2',
      channel: 'sms',
      householdId: 'hh-1',
      recipientRole: 'parent',
      recipientName: 'Anna',
      payload: { kind: 'alert_created' },
    });

    expect(result.ok).toBe(true);
    expect(result.provider).toBe('twilio');
    fetchMock.mockRestore();
  });
});
