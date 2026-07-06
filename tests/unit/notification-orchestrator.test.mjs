import { describe, expect, it } from 'vitest';
import { orchestrateAlertCreated } from '../../server/services/notification-orchestrator.mjs';
import { listDeliveriesForHousehold, resetNotificationStore } from '../../server/services/notification-service.mjs';

describe('notification-orchestrator', () => {
  it('queues in-app and placeholder external channels for new alerts', async () => {
    resetNotificationStore();

    const deliveries = await orchestrateAlertCreated({
      householdId: 'hh-1',
      alertId: 'alert-1',
      primaryContact: { role: 'parent', name: 'Anna' },
      payload: { level: 'critical' },
    });

    expect(deliveries).toHaveLength(3);
    expect(deliveries.map((entry) => entry.channel).sort()).toEqual(['in_app', 'push', 'sms']);

    const stored = listDeliveriesForHousehold('hh-1');
    expect(stored).toHaveLength(3);
    expect(stored.some((entry) => entry.channel === 'in_app' && entry.state === 'delivered')).toBe(true);
    expect(stored.some((entry) => entry.channel === 'push' && entry.state === 'queued')).toBe(true);
  });
});
