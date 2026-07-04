export const DIABETES_TYPES = ['type1', 'type2'];

export const normalizeDiabetesType = (value) => (value === 'type2' ? 'type2' : 'type1');

export const defaultSafetyPreferences = (diabetesType = 'type1') => {
  if (normalizeDiabetesType(diabetesType) === 'type2') {
    return {
      daySensitivity: 'gentle',
      nightSensitivity: 'balanced',
      caregiverDelaySeconds: 60,
      dayPrimaryContact: 'parent',
      nightPrimaryContact: 'parent',
      glucoseUnit: 'mmol/L',
    };
  }

  return {
    daySensitivity: 'balanced',
    nightSensitivity: 'protective',
    caregiverDelaySeconds: 60,
    dayPrimaryContact: 'parent',
    nightPrimaryContact: 'parent',
    glucoseUnit: 'mmol/L',
  };
};
