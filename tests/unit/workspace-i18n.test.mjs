import { describe, expect, it } from 'vitest';
import { inferContextualSummaryKey } from '../../server/workspace-i18n-data.mjs';
import { localizeWorkspacePayload } from '../../server/workspace-i18n.mjs';

const basePayload = {
  needsSetup: false,
  user: { role: 'parent', email: 'a@example.com', fullName: 'Anna' },
  household: { childName: 'Mila', caregiverName: 'Jordan', primaryParent: 'Anna' },
  currentState: { level: 'ok', dataStatus: 'live', responder: 'Anna' },
  dexcomHealth: { reason: 'ok', state: 'healthy', headline: 'Dexcom sync is healthy.' },
  householdReadiness: { state: 'ready', headline: 'ready' },
  dailyGuidance: { title: 'Parent Daily Guidance', now: 'Keep Mila...', watch: 'Watch', fallback: 'fallback', checklist: [] },
  contextualSummary: { tone: 'calm', headline: 'steady', detail: 'detail' },
};

describe('workspace-i18n', () => {
  it('localizes workspace payload for Russian', () => {
    const localized = localizeWorkspacePayload('ru', basePayload);
    expect(localized.dailyGuidance.title).toContain('родителя');
    expect(localized.dexcomHealth.headline).toContain('Dexcom');
    expect(localized.householdReadiness.headline).toContain('Семья');
    expect(localized.contextualSummary.headline).toContain('спокойном');
  });

  it('infers broken auth contextual summary key', () => {
    const key = inferContextualSummaryKey({
      ...basePayload,
      dexcomHealth: { reason: 'broken_auth' },
    });
    expect(key).toBe('broken_auth');
  });

  it('localizes broken auth summary in Russian', () => {
    const localized = localizeWorkspacePayload('ru', {
      ...basePayload,
      dexcomHealth: { reason: 'broken_auth', state: 'broken' },
      contextualSummary: { tone: 'attention', headline: 'x', detail: 'y' },
    });
    expect(localized.contextualSummary.headline).toContain('синхрониза');
    expect(localized.dexcomHealth.headline).toContain('авториза');
  });

  it('localizes daily guidance checklist in Russian', () => {
    const localized = localizeWorkspacePayload('ru', basePayload);
    expect(localized.dailyGuidance.checklist.length).toBe(3);
    expect(localized.dailyGuidance.watch).toContain('Следите');
    expect(localized.dailyGuidance.fallback).toBeTruthy();
  });

  it('localizes monitoring timeline events', () => {
    const localized = localizeWorkspacePayload('ru', {
      ...basePayload,
      timeline: [{ kind: 'monitoring_active', step: 'Monitoring active', detail: 'English detail', status: 'done' }],
      recentEvents: [{ kind: 'monitoring_active', step: 'Monitoring active', detail: 'English detail', status: 'done' }],
    });
    expect(localized.recentEvents[0].step).toContain('Мониторинг');
    expect(localized.recentEvents[0].detail).toContain('мониторинге');
  });

  it('localizes review summary headline', () => {
    const localized = localizeWorkspacePayload('ru', {
      ...basePayload,
      notificationSummary: { deliveryStatus: 'escalated' },
      reviewSummary: {
        headline: 'English',
        stabilityScore: 80,
        deliveryReliability: 'fragile',
        responseConsistency: 'watch',
        pattern: 'steady',
        notes: ['a', 'b'],
        nextFocus: 'English focus',
      },
    });
    expect(localized.reviewSummary.headline).toContain('резерв');
    expect(localized.reviewSummary.notes[0]).toContain('эскал');
  });

  it('localizes type2 daily guidance differently in Russian', () => {
    const localized = localizeWorkspacePayload('ru', {
      ...basePayload,
      household: { ...basePayload.household, diabetesType: 'type2' },
      user: { ...basePayload.user, role: 'adult' },
    });
    expect(localized.dailyGuidance.now).toContain('высок');
    expect(localized.dailyGuidance.watch).toContain('высок');
  });
});
