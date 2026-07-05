import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cookieFromResponse, invoke } from '../helpers/http-mock.mjs';

let handleRequest;
let dataDir;

beforeAll(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), 't1d-sec-int-'));
  process.env.T1D_DATA_DIR = dataDir;
  delete process.env.DATABASE_URL;
  process.env.T1D_CRON_SECRET = 'test-cron-secret-value-1234567890';
  delete process.env.VERCEL;
  ({ handleRequest } = await import('../../server/index.mjs'));
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe('security hardening', () => {
  it('rejects cron requests without bearer secret', async () => {
    const response = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/cron/dexcom-sync',
    });
    expect(response.status).toBe(401);
  });

  it('accepts cron requests with valid bearer secret', async () => {
    const response = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/cron/dexcom-sync',
      headers: { authorization: 'Bearer test-cron-secret-value-1234567890' },
    });
    expect(response.status).toBe(200);
    expect(response.json().ok).toBe(true);
  });

  it('requires invited slot for household join', async () => {
    const ownerEmail = `owner-${Date.now()}@example.com`;
    const joinerEmail = `joiner-${Date.now()}@example.com`;

    const ownerSignup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email: ownerEmail,
        password: 'SecurityPass123!',
        fullName: 'Owner Parent',
        role: 'parent',
      },
    });
    const ownerCookie = cookieFromResponse(ownerSignup, 't1d_sid');

    const setup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: {
        cookie: `t1d_sid=${ownerCookie}`,
        'content-type': 'application/json',
      },
      body: {
        householdName: 'Security Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Owner',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });
    const inviteCode = setup.json().household.inviteCode;
    expect(inviteCode.length).toBeGreaterThanOrEqual(16);

    const joinerSignup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email: joinerEmail,
        password: 'SecurityPass123!',
        fullName: 'Random Parent',
        role: 'parent',
      },
    });
    const joinerCookie = cookieFromResponse(joinerSignup, 't1d_sid');

    const joinAttempt = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/join',
      headers: {
        cookie: `t1d_sid=${joinerCookie}`,
        'content-type': 'application/json',
      },
      body: { inviteCode },
    });
    expect(joinAttempt.status).toBe(403);
  });

  it('invalidates sessions after password reset confirm', async () => {
    process.env.T1D_EXPOSE_RESET_TOKEN = 'true';
    const email = `reset-${Date.now()}@example.com`;

    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email,
        password: 'SecurityPass123!',
        fullName: 'Reset User',
        role: 'parent',
      },
    });
    const sessionCookie = cookieFromResponse(signup, 't1d_sid');

    const requestReset = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/password-reset/request',
      headers: { 'content-type': 'application/json' },
      body: { email },
    });
    const resetToken = requestReset.json().resetToken;
    expect(resetToken).toBeTruthy();

    const confirm = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/password-reset/confirm',
      headers: { 'content-type': 'application/json' },
      body: { token: resetToken, password: 'NewSecurityPass123!' },
    });
    expect(confirm.status).toBe(200);

    const sessionAfterReset = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/session',
      headers: { cookie: `t1d_sid=${sessionCookie}` },
    });
    expect(sessionAfterReset.json().authenticated).toBe(false);
    delete process.env.T1D_EXPOSE_RESET_TOKEN;
  });
});
