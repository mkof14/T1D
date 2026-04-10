export type Language = 'en' | 'ru' | 'uk' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'he' | 'ar';
export type UserRole = 'child' | 'parent' | 'caregiver' | 'adult';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'he', 'ar'];

export const RTL_LANGUAGES: Language[] = ['he', 'ar'];

export const ROLE_LABELS: Record<Language, Record<UserRole, string>> = {
  en: { child: 'Child', parent: 'Parent', caregiver: 'Support Adult', adult: 'Adult With T1D' },
  ru: { child: 'Ребёнок', parent: 'Родитель', caregiver: 'Помогающий Взрослый', adult: 'Взрослый С T1D' },
  uk: { child: 'Дитина', parent: 'Батько Або Мати', caregiver: 'Дорослий Для Підтримки', adult: 'Дорослий З T1D' },
  es: { child: 'Niño', parent: 'Padre O Madre', caregiver: 'Adulto De Apoyo', adult: 'Adulto Con T1D' },
  fr: { child: 'Enfant', parent: 'Parent', caregiver: 'Adulte De Soutien', adult: 'Adulte Avec Un T1D' },
  de: { child: 'Kind', parent: 'Elternteil', caregiver: 'Unterstützende Person', adult: 'Erwachsene Person Mit T1D' },
  zh: { child: '儿童', parent: '家长', caregiver: '支持的大人', adult: '患有 T1D 的成年人' },
  ja: { child: '子ども', parent: '保護者', caregiver: '支える大人', adult: 'T1D のある成人' },
  pt: { child: 'Criança', parent: 'Responsável', caregiver: 'Adulto De Apoio', adult: 'Adulto Com T1D' },
  he: { child: 'ילד או ילדה', parent: 'הורה', caregiver: 'מבוגר תומך', adult: 'מבוגר עם T1D' },
  ar: { child: 'طفل', parent: 'ولي أمر', caregiver: 'شخص بالغ داعم', adult: 'بالغ يعيش مع T1D' },
};
