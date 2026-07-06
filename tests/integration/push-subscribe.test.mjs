import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cookieFromResponse, invoke } from '../helpers/http-mock.mjs';

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

let handleRequest;
let dataDir;

beforeAll(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), 't1d-push-int-'));
  process.env.T1D_DATA_DIR = dataDir;
  process.env.DATABASE_URL = ' ';
  process.env.T1D_VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
  process.env.T1D_VAPID_PRIVATE_KEY = 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSGDxwqzNuqxXgY';
  process.env.T1D_VAPID_SUBJECT = 'mailto:ops@example.com';
  vi.resetModules();
  ({ handleRequest } = await import('../../server/index.mjs'));
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
  delete process.env.T1D_VAPID_PUBLIC_KEY;
  delete process.env.T1D_VAPID_PRIVATE_KEY;
  delete process.env.T1D_VAPID_SUBJECT;
});

describe('push subscription API', () => {
  it('returns push config for authenticated user', async () => {
    const email = `push-${Date.now()}@example.com`;
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email,
        password: 'IntegrationPass123!',
        fullName: 'Push Parent',
        role: 'parent',
      },
    });
    const cookie = cookieFromResponse(signup, 't1d_sid');

    await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: { cookie: `t1d_sid=${cookie}`, 'content-type': 'application/json' },
      body: {
        householdName: 'Push Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Anna',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });

    const config = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/push/config',
      headers: { cookie: `t1d_sid=${cookie}` },
    });
    expect(config.status).toBe(200);
    expect(config.json().enabled).toBe(true);
    expect(config.json().publicKey).toBeTruthy();
    expect(config.json().subscribed).toBe(false);
  });

  it('stores a push subscription for the current user', async () => {
    const email = `push-sub-${Date.now()}@example.com`;
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email,
        password: 'IntegrationPass123!',
        fullName: 'Push Sub Parent',
        role: 'parent',
      },
    });
    const cookie = cookieFromResponse(signup, 't1d_sid');

    await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: { cookie: `t1d_sid=${cookie}`, 'content-type': 'application/json' },
      body: {
        householdName: 'Sub Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Anna',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });

    const subscribe = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/push/subscribe',
      headers: { cookie: `t1d_sid=${cookie}`, 'content-type': 'application/json' },
      body: {
        endpoint: 'https://push.example.test/subscription/1',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        },
      },
    });
    expect(subscribe.status).toBe(200);
    expect(subscribe.json().ok).toBe(true);

    const config = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/push/config',
      headers: { cookie: `t1d_sid=${cookie}` },
    });
    expect(config.json().subscribed).toBe(true);
    expect(config.json().subscriptionCount).toBe(1);
  });
});
