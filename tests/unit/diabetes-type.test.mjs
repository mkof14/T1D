import { describe, expect, it } from 'vitest';
import { defaultSafetyPreferences, normalizeDiabetesType } from '../../server/diabetes-type.mjs';

describe('diabetes-type', () => {
  it('defaults unknown values to type1', () => {
    expect(normalizeDiabetesType(undefined)).toBe('type1');
    expect(normalizeDiabetesType('type3')).toBe('type1');
    expect(normalizeDiabetesType('type2')).toBe('type2');
  });

  it('uses tighter defaults for type1 households', () => {
    expect(defaultSafetyPreferences('type1')).toEqual({
      daySensitivity: 'balanced',
      nightSensitivity: 'protective',
      caregiverDelaySeconds: 60,
      dayPrimaryContact: 'parent',
      nightPrimaryContact: 'parent',
      glucoseUnit: 'mg/dL',
      contactPhones: { parent: '', adult: '', caregiver: '' },
    });
  });

  it('uses gentler defaults for type2 households', () => {
    expect(defaultSafetyPreferences('type2')).toEqual({
      daySensitivity: 'gentle',
      nightSensitivity: 'balanced',
      caregiverDelaySeconds: 60,
      dayPrimaryContact: 'parent',
      nightPrimaryContact: 'parent',
      glucoseUnit: 'mmol/L',
      contactPhones: { parent: '', adult: '', caregiver: '' },
    });
  });
});
