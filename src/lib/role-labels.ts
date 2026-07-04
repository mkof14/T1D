import { ROLE_LABELS, type DiabetesType, type Language, type UserRole } from '../types';
import { TYPE2_ACCESS_LABELS } from '../content/member-path-copy';

const ADULT_ROLE_BY_TYPE: Record<Language, Record<'type1' | 'type2', string>> = {
  en: { type1: 'Adult With T1D', type2: 'Adult With T2D' },
  ru: { type1: 'Взрослый С T1D', type2: 'Взрослый С T2D' },
  uk: { type1: 'Дорослий З T1D', type2: 'Дорослий З T2D' },
  es: { type1: 'Adulto Con T1D', type2: 'Adulto Con T2D' },
  fr: { type1: 'Adulte Avec T1D', type2: 'Adulte Avec T2D' },
  de: { type1: 'Erwachsene Person Mit T1D', type2: 'Erwachsene Person Mit T2D' },
  zh: { type1: '患有 T1D 的成年人', type2: '患有 T2D 的成年人' },
  ja: { type1: 'T1D のある成人', type2: 'T2D のある成人' },
  pt: { type1: 'Adulto Com T1D', type2: 'Adulto Com T2D' },
  he: { type1: 'מבוגר עם T1D', type2: 'מבוגר עם T2D' },
  ar: { type1: 'بالغ يعيش مع T1D', type2: 'بالغ يعيش مع T2D' },
};

export const getRoleLabels = (lang: Language, diabetesType: DiabetesType = 'type1') => {
  const typeKey = diabetesType === 'type2' ? 'type2' : 'type1';
  const labels = {
    ...ROLE_LABELS[lang],
    adult: ADULT_ROLE_BY_TYPE[lang][typeKey],
  } satisfies Record<UserRole, string>;

  if (diabetesType === 'type2') {
    const t2 = TYPE2_ACCESS_LABELS[lang];
    return {
      ...labels,
      parent: t2.partnerRole,
      caregiver: t2.trustedContactRole,
    };
  }

  return labels;
};
