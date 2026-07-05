import { describe, expect, it } from 'vitest';
import { buildPatientTimeline } from '../../server/domain/timeline/timeline-service.mjs';

describe('timeline service', () => {
  it('builds unified patient timeline with readings and events', () => {
    const timeline = buildPatientTimeline({
      id: 'hh-1',
      childName: 'Mila',
      dexcom: {
        status: 'connected',
        latestTimestamp: new Date().toISOString(),
        dataFreshness: 'live',
        readings: [{ id: 'r1', timestamp: new Date().toISOString(), glucose: 102, trend: 'flat' }],
      },
      safetyState: {
        stage: 'parent_alerted',
        eventLog: [{ id: 'e1', kind: 'alert', step: 'Risk detected', detail: 'Low trend', status: 'active', time: '02:14' }],
      },
    });
    expect(timeline.patientId).toBe('hh-1');
    expect(timeline.entries.length).toBeGreaterThan(1);
    expect(timeline.ruleVersion).toBeTruthy();
  });
});
