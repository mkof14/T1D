import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { cookieFromResponse, invoke } from '../helpers/http-mock.mjs';

let handleRequest;
let dataDir;

beforeAll(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), 't1d-timeline-int-'));
  process.env.T1D_DATA_DIR = dataDir;
  delete process.env.DATABASE_URL;
  ({ handleRequest } = await import('../../server/index.mjs'));
});

afterAll(() => {
  rmSync(dataDir, { recursive: true, force: true });
});

describe('alert timeline API', () => {
  it('returns patient timeline for authenticated household', async () => {
    const email = `timeline-${Date.now()}@example.com`;
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: { email, password: 'TimelinePass123!', fullName: 'Timeline Parent', role: 'parent' },
    });
    const cookie = cookieFromResponse(signup, 't1d_sid');
    await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: { cookie: `t1d_sid=${cookie}`, 'content-type': 'application/json' },
      body: {
        householdName: 'Timeline Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Anna',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });

    const timeline = await invoke(handleRequest, {
      method: 'GET',
      url: '/api/timeline/hh-placeholder',
      headers: { cookie: `t1d_sid=${cookie}` },
    });
    expect(timeline.status).toBe(200);
    expect(Array.isArray(timeline.json().entries)).toBe(true);
    expect(timeline.json().ruleVersion).toBeTruthy();
  });

  it('returns conflict when acknowledging without an active alert', async () => {
    const email = `timeline-ack-${Date.now()}@example.com`;
    const signup = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/access/signup',
      headers: { 'content-type': 'application/json' },
      body: { email, password: 'TimelinePass123!', fullName: 'Ack Parent', role: 'parent' },
    });
    const cookie = cookieFromResponse(signup, 't1d_sid');
    await invoke(handleRequest, {
      method: 'POST',
      url: '/api/household/setup',
      headers: { cookie: `t1d_sid=${cookie}`, 'content-type': 'application/json' },
      body: {
        householdName: 'Ack Circle',
        childName: 'Mila',
        childAgeBand: '8-12',
        primaryParent: 'Anna',
        caregiverName: 'Jordan',
        nightWindow: '10:00 PM - 7:00 AM',
        diabetesType: 'type1',
      },
    });

    const response = await invoke(handleRequest, {
      method: 'POST',
      url: '/api/alerts/missing-alert/acknowledge',
      headers: { cookie: `t1d_sid=${cookie}`, 'content-type': 'application/json' },
      body: {},
    });

    expect(response.status).toBe(409);
    expect(response.json().error).toBe('alert_not_found');
  });
});
