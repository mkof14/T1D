import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cookieFromResponse, invoke } from '../helpers/http-mock.mjs';

let handleRequest;
let dataDir;

beforeAll(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), 't1d-api-int-'));
  process.env.T1D_DATA_DIR = dataDir;
  process.env.T1D_CRON_SECRET = 'integration-admin-secret';
  process.env.DATABASE_URL = ' ';
  delete process.env.T1D_GOOGLE_CLIENT_ID;
  delete process.env.T1D_GOOGLE_CLIENT_SECRET;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  vi.resetModules();
  ({ handleRequest } = await import('../../server/index.mjs'));
  process.env.T1D_GOOGLE_CLIENT_ID = '';
  process.env.T1D_GOOGLE_CLIENT_SECRET = '';
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe('api handlers', () => {
  it('returns health with security headers and request id', async () => {
    const response = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/health?verbose=1',
      headers: { 'x-request-id': 'test-health-id' },
    });

    expect(response.status).toBe(200);
    expect(response.json().ok).toBe(true);
    expect(response.json().requestId).toBe('test-health-id');
    expect(typeof response.json().sqlRead).toBe('string');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['x-request-id']).toBe('test-health-id');
  });

  it('reports unauthenticated session state', async () => {
    const response = await invoke(handleRequest, { method: 'GET', url: '/api/session' });
    expect(response.status).toBe(200);
    expect(response.json()).toEqual({ authenticated: false });
  });

  it('reports google auth availability', async () => {
    const response = await invoke(handleRequest, { method: 'GET', url: '/api/access/google/status' });
    expect(response.status).toBe(200);
    expect(response.json()).toEqual({
      enabled: false,
      flow: 'google-identity-services',
      clientId: '',
      javascriptOrigins: expect.any(Array),
      setupHint: expect.any(String),
    });
  });

  it('signs up, loads workspace, and accepts feedback', async () => {
    const email = `integration-${Date.now()}@example.com`;
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json', 'x-t1d-lang': 'ru' },
      body: {
        email,
        password: 'IntegrationPass123!',
        fullName: 'Integration Parent',
        role: 'parent',
      },
    });

    expect(signup.status).toBe(201);
    const sessionCookie = cookieFromResponse(signup, 't1d_sid');
    expect(sessionCookie).toBeTruthy();

    const workspaceBeforeSetup = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/workspace',
      headers: { cookie: `t1d_sid=${sessionCookie}`, 'x-t1d-lang': 'ru' },
    });
    expect(workspaceBeforeSetup.status).toBe(200);
    expect(workspaceBeforeSetup.json().needsSetup).toBe(true);

    const setup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: {
        cookie: `t1d_sid=${sessionCookie}`,
        'content-type': 'application/json',
        'x-t1d-lang': 'ru',
      },
      body: {
        householdName: 'Integration Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Anna',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });
    expect(setup.status).toBe(200);
    expect(setup.json().household.diabetesType).toBe('type1');
    expect(setup.json().household.safetyPreferences.nightSensitivity).toBe('protective');

    const setupType2 = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json', 'x-t1d-lang': 'en' },
      body: {
        email: `integration-t2-${Date.now()}@example.com`,
        password: 'IntegrationPass123!',
        fullName: 'Type2 Parent',
        role: 'parent',
      },
    });
    expect(setupType2.status).toBe(201);
    const type2Cookie = cookieFromResponse(setupType2, 't1d_sid');
    const type2Setup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: {
        cookie: `t1d_sid=${type2Cookie}`,
        'content-type': 'application/json',
        'x-t1d-lang': 'en',
      },
      body: {
        householdName: 'Type2 Circle',
        childName: 'Alex',
        childAgeBand: '13-17',
        primaryParent: 'Sam',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type2',
      },
    });
    expect(type2Setup.status).toBe(200);
    expect(type2Setup.json().household.diabetesType).toBe('type2');
    expect(type2Setup.json().household.safetyPreferences.daySensitivity).toBe('gentle');

    const workspace = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/workspace',
      headers: { cookie: `t1d_sid=${sessionCookie}`, 'x-t1d-lang': 'ru' },
    });
    expect(workspace.status).toBe(200);
    expect(workspace.json().needsSetup).toBe(false);
    expect(workspace.json().dailyGuidance.title).toContain('родителя');

    const feedback = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/feedback',
      headers: {
        cookie: `t1d_sid=${sessionCookie}`,
        'content-type': 'application/json',
      },
      body: { message: 'Integration feedback looks good', rating: 5 },
    });
    expect(feedback.status).toBe(201);
    expect(feedback.json()).toEqual({ ok: true });
  });

  it('rejects duplicate signup with conflict', async () => {
    const email = `duplicate-${Date.now()}@example.com`;
    const body = {
      email,
      password: 'IntegrationPass123!',
      fullName: 'Duplicate Parent',
      role: 'parent',
    };
    const first = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body,
    });
    expect(first.status).toBe(201);

    const second = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body,
    });
    expect(second.status).toBe(409);
    expect(second.json().error).toBe('Unable to create account with these details');
  });

  it('rejects feedback without a message', async () => {
    const response = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/feedback',
      headers: { 'content-type': 'application/json' },
      body: { rating: 4 },
    });
    expect(response.status).toBe(400);
    expect(response.json().error).toBe('Message is required');
  });

  it('serves OpenAPI spec', async () => {
    const response = await invoke(handleRequest, { method: 'GET', url: '/api/openapi.yaml' });
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('yaml');
    expect(response.text()).toContain('openapi:');
  });

  it('deletes account after password confirmation', async () => {
    const email = `delete-${Date.now()}@example.com`;
    const password = 'IntegrationPass123!';
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email,
        password,
        fullName: 'Delete Me',
        role: 'parent',
      },
    });
    expect(signup.status).toBe(201);
    const sessionCookie = cookieFromResponse(signup, 't1d_sid');

    const deleted = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/account/delete',
      headers: {
        cookie: `t1d_sid=${sessionCookie}`,
        'content-type': 'application/json',
      },
      body: { password },
    });
    expect(deleted.status).toBe(200);
    expect(deleted.json().ok).toBe(true);

    const sessionAfter = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/session',
      headers: { cookie: `t1d_sid=${sessionCookie}` },
    });
    expect(sessionAfter.json().authenticated).toBe(false);
  });

  it('returns admin summary with bearer secret', async () => {
    const response = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/admin/summary',
      headers: { authorization: 'Bearer integration-admin-secret' },
    });
    expect(response.status).toBe(200);
    expect(response.json().ok).toBe(true);
    expect(response.json().kv).toBeTruthy();
    expect(Array.isArray(response.json().recommendations)).toBe(true);
  });

  it('runs cron escalation pass for stale alerts', async () => {
    const email = `cron-${Date.now()}@example.com`;
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: {
        email,
        password: 'IntegrationPass123!',
        fullName: 'Cron Parent',
        role: 'parent',
      },
    });
    const sessionCookie = cookieFromResponse(signup, 't1d_sid');
    await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: {
        cookie: `t1d_sid=${sessionCookie}`,
        'content-type': 'application/json',
      },
      body: {
        householdName: 'Cron Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Anna',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });

    const { readFileSync, writeFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const householdsPath = join(dataDir, 'households.json');
    const payload = JSON.parse(readFileSync(householdsPath, 'utf8'));
    const household = payload.households[0];
    household.safetyPreferences = {
      ...(household.safetyPreferences || {}),
      caregiverDelaySeconds: 20,
    };
    household.safetyState = {
      ...(household.safetyState || {}),
      stage: 'parent_alerted',
      escalationCount: 0,
      lastAlertAt: new Date(Date.now() - 120_000).toISOString(),
      responderOwnership: {
        state: 'notified',
        primaryRole: 'parent',
        primaryName: 'Anna',
        alertId: 'alert-cron-1',
        notifiedAt: new Date(Date.now() - 120_000).toISOString(),
      },
      eventLog: [{ id: 'alert-cron-1', kind: 'alert', status: 'active' }],
    };
    writeFileSync(householdsPath, JSON.stringify(payload));

    const cron = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/cron/dexcom-sync',
      headers: { authorization: 'Bearer integration-admin-secret' },
    });
    expect(cron.status).toBe(200);
    expect(cron.json().escalation?.escalated).toBeGreaterThan(0);
  });
});
