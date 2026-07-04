import React from 'react';
import { DIABETES_TYPE_COPY, diabetesTypeKey } from '../content/diabetes-type-copy';
import { MEMBER_PATH_COPY, TYPE2_ACCESS_LABELS, TYPE2_SETUP_FIELDS } from '../content/member-path-copy';
import { readSignupDiabetesType } from '../lib/signup-diabetes-type';
import { RTL_LANGUAGES, type DiabetesType, type Language, type UserRole } from '../types';
import { t1dInput, t1dSoftLabel, t1dSubcard, type T1DTheme } from '../lib/t1d-ui';

const PRESET_COPY: Record<Language, { locked: string }> = {
  en: { locked: 'Chosen on the home page. Thresholds and support stay on this path.' },
  ru: { locked: 'Выбрано на главной странице. Пороги и поддержка остаются на этом пути.' },
  uk: { locked: 'Обрано на головній сторінці. Пороги та підтримка залишаються на цьому шляху.' },
  es: { locked: 'Elegido en la página principal.' },
  fr: { locked: 'Choisi sur la page d’accueil.' },
  de: { locked: 'Auf der Startseite gewählt.' },
  zh: { locked: '已在首页选择。' },
  ja: { locked: 'ホームで選択済み。' },
  pt: { locked: 'Escolhido na página inicial.' },
  he: { locked: 'נבחר בדף הבית.' },
  ar: { locked: 'تم الاختيار في الصفحة الرئيسية.' },
};

const FIELD_COPY: Record<Language, {
  fields: Record<'householdName' | 'childName' | 'childAgeBand' | 'primaryParent' | 'caregiverName' | 'nightWindow', string>;
  placeholders: Record<'householdName' | 'childName' | 'childAgeBand' | 'primaryParent' | 'caregiverName' | 'nightWindow', string>;
}> = {
  en: {
    fields: { householdName: 'Family Name', childName: 'Child Name', childAgeBand: 'Child Age Band', primaryParent: 'Primary Parent', caregiverName: 'Backup Support Adult', nightWindow: 'Night Window' },
    placeholders: { householdName: 'Mila Support Circle', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna Rivera', caregiverName: 'Jordan Lee', nightWindow: '10:00 PM - 7:00 AM' },
  },
  ru: {
    fields: { householdName: 'Название Семьи', childName: 'Имя Ребёнка', childAgeBand: 'Возраст Ребёнка', primaryParent: 'Основной Родитель', caregiverName: 'Резервный Помогающий Взрослый', nightWindow: 'Ночное Окно' },
    placeholders: { householdName: 'Ночной Круг Милы', childName: 'Мила', childAgeBand: '8-12', primaryParent: 'Анна Ривера', caregiverName: 'Джордан Ли', nightWindow: '22:00 - 07:00' },
  },
  uk: {
    fields: { householdName: 'Назва Сімʼї', childName: 'Імʼя Дитини', childAgeBand: 'Вік Дитини', primaryParent: 'Основний Батько', caregiverName: 'Резервний Дорослий', nightWindow: 'Нічне Вікно' },
    placeholders: { householdName: 'Коло Мили', childName: 'Мила', childAgeBand: '8-12', primaryParent: 'Анна', caregiverName: 'Джордан', nightWindow: '22:00 - 07:00' },
  },
  es: {
    fields: { householdName: 'Nombre De La Familia', childName: 'Nombre Del Niño', childAgeBand: 'Edad', primaryParent: 'Padre Principal', caregiverName: 'Apoyo De Reserva', nightWindow: 'Ventana Nocturna' },
    placeholders: { householdName: 'Círculo De Mila', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  fr: {
    fields: { householdName: 'Nom De La Famille', childName: 'Nom De L’enfant', childAgeBand: 'Tranche D’âge', primaryParent: 'Parent Principal', caregiverName: 'Adulte De Relais', nightWindow: 'Plage Nocturne' },
    placeholders: { householdName: 'Cercle De Mila', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  de: {
    fields: { householdName: 'Familienname', childName: 'Name Des Kindes', childAgeBand: 'Altersgruppe', primaryParent: 'Hauptelternteil', caregiverName: 'Reserve', nightWindow: 'Nachtfenster' },
    placeholders: { householdName: 'Milas Kreis', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  zh: {
    fields: { householdName: '家庭名称', childName: '孩子姓名', childAgeBand: '年龄段', primaryParent: '主要家长', caregiverName: '后备支持', nightWindow: '夜间窗口' },
    placeholders: { householdName: 'Mila 支持圈', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  ja: {
    fields: { householdName: '家族名', childName: 'お子さまの名前', childAgeBand: '年齢', primaryParent: '主な保護者', caregiverName: '予備サポート', nightWindow: '夜間ウィンドウ' },
    placeholders: { householdName: 'Mila サークル', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  pt: {
    fields: { householdName: 'Nome Da Família', childName: 'Nome Da Criança', childAgeBand: 'Faixa Etária', primaryParent: 'Responsável Principal', caregiverName: 'Apoio Reserva', nightWindow: 'Janela Noturna' },
    placeholders: { householdName: 'Círculo Da Mila', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  he: {
    fields: { householdName: 'שם המשפחה', childName: 'שם הילד/ה', childAgeBand: 'טווח גיל', primaryParent: 'הורה ראשי', caregiverName: 'תומך גיבוי', nightWindow: 'חלון לילה' },
    placeholders: { householdName: 'מעגל מila', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
  ar: {
    fields: { householdName: 'اسم الأسرة', childName: 'اسم الطفل', childAgeBand: 'الفئة العمرية', primaryParent: 'الوالد الأساسي', caregiverName: 'الدعم الاحتياطي', nightWindow: 'نافذة الليل' },
    placeholders: { householdName: 'دائرة Mila', childName: 'Mila', childAgeBand: '8-12', primaryParent: 'Anna', caregiverName: 'Jordan', nightWindow: '22:00 - 07:00' },
  },
};

export type HouseholdFormState = {
  householdName: string;
  childName: string;
  childAgeBand: string;
  primaryParent: string;
  caregiverName: string;
  nightWindow: string;
};

export const createInitialHouseholdForm = (lang: Language, role: UserRole, fullName: string, presetType: DiabetesType | null): HouseholdFormState => {
  const base = FIELD_COPY[lang];
  const type2 = presetType === 'type2' ? TYPE2_SETUP_FIELDS[lang] : null;
  const personName =
    role === 'child' || (presetType === 'type2' && role === 'adult')
      ? fullName
      : (type2?.placeholders.childName ?? base.placeholders.childName);
  return {
    householdName: type2?.placeholders.householdName ?? base.placeholders.householdName,
    childName: personName,
    childAgeBand: type2?.placeholders.childAgeBand ?? base.placeholders.childAgeBand,
    primaryParent: role === 'parent' ? fullName : (type2?.placeholders.primaryParent ?? base.placeholders.primaryParent),
    caregiverName: role === 'caregiver' ? fullName : (type2?.placeholders.caregiverName ?? base.placeholders.caregiverName),
    nightWindow: type2?.placeholders.nightWindow ?? base.placeholders.nightWindow,
  };
};

interface HouseholdSetupFieldsProps {
  lang: Language;
  theme: T1DTheme;
  role: UserRole;
  form: HouseholdFormState;
  onChange: (key: keyof HouseholdFormState, value: string) => void;
  diabetesType: DiabetesType;
  onDiabetesTypeChange?: (type: DiabetesType) => void;
  presetType?: DiabetesType | null;
  compact?: boolean;
}

export const HouseholdSetupFields: React.FC<HouseholdSetupFieldsProps> = ({
  lang,
  theme,
  role,
  form,
  onChange,
  diabetesType,
  onDiabetesTypeChange,
  presetType = readSignupDiabetesType(),
  compact = false,
}) => {
  const isRTL = RTL_LANGUAGES.includes(lang);
  const base = FIELD_COPY[lang];
  const type2 = presetType === 'type2' ? TYPE2_SETUP_FIELDS[lang] : null;
  const diabetesCopy = DIABETES_TYPE_COPY[lang];
  const softLabelClass = t1dSoftLabel(theme);
  const fieldLabels = type2
    ? {
        householdName: type2.householdName,
        childName: type2.childName,
        childAgeBand: type2.childAgeBand,
        primaryParent: type2.primaryParent,
        caregiverName: type2.caregiverName,
        nightWindow: base.fields.nightWindow,
      }
    : base.fields;
  const fieldPlaceholders = type2
    ? { ...base.placeholders, ...type2.placeholders }
    : base.placeholders;

  return (
    <div className={`grid gap-5 ${compact ? '' : 'md:grid-cols-2'}`}>
      <div className={`space-y-3 ${compact ? '' : 'md:col-span-2'}`}>
        <p className={softLabelClass}>{diabetesCopy.field}</p>
        {presetType ? (
          <div className={`${t1dSubcard(theme)} ring-2 ring-orange-400/80 dark:ring-amber-400/70 p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-black text-slate-900 dark:text-slate-100">{diabetesCopy[diabetesTypeKey(presetType)].label}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{diabetesCopy[diabetesTypeKey(presetType)].description}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{PRESET_COPY[lang].locked}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(['type1', 'type2'] as DiabetesType[]).map((type) => {
              const option = diabetesCopy[diabetesTypeKey(type)];
              const active = diabetesType === type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onDiabetesTypeChange?.(type)}
                  className={`${t1dSubcard(theme)} ${active ? 'ring-2 ring-orange-400/80 dark:ring-amber-400/70' : ''} p-4 transition ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">{option.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{option.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {(Object.keys(fieldLabels) as Array<keyof HouseholdFormState>).map((key) => (
        <div key={key} className={key === 'householdName' ? `space-y-2 ${compact ? '' : 'md:col-span-2'}` : 'space-y-2'}>
          <label className={softLabelClass}>{fieldLabels[key]}</label>
          <input
            className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`}
            value={form[key]}
            onChange={(event) => onChange(key, event.target.value)}
            placeholder={fieldPlaceholders[key]}
          />
        </div>
      ))}
    </div>
  );
};

export const getHouseholdSetupSectionCopy = (lang: Language, presetType: DiabetesType | null) => {
  if (presetType === 'type2') {
    const t2 = TYPE2_ACCESS_LABELS[lang];
    return { title: t2.householdSectionTitle, subtitle: t2.householdSectionSubtitle };
  }
  return HOUSEHOLD_SETUP_SECTION_COPY[lang];
};

export const HOUSEHOLD_SETUP_SECTION_COPY: Record<Language, { title: string; subtitle: string }> = {
  en: { title: 'Your family circle', subtitle: 'Fill this once — account and household on the same screen.' },
  ru: { title: 'Ваш семейный круг', subtitle: 'Заполните один раз — аккаунт и семья на одном экране.' },
  uk: { title: 'Ваше сімейне коло', subtitle: 'Заповніть один раз — акаунт і сімʼя на одному екрані.' },
  es: { title: 'Su círculo familiar', subtitle: 'Complete una vez — cuenta y hogar en la misma pantalla.' },
  fr: { title: 'Votre cercle familial', subtitle: 'Remplissez une fois — compte et foyer sur le même écran.' },
  de: { title: 'Ihr Familienkreis', subtitle: 'Einmal ausfüllen — Konto und Haushalt auf einem Bildschirm.' },
  zh: { title: '您的家庭圈', subtitle: '一次填写 — 账号与家庭在同一页。' },
  ja: { title: '家族サークル', subtitle: '一度に入力 — アカウントと世帯を同じ画面で。' },
  pt: { title: 'Seu círculo familiar', subtitle: 'Preencha uma vez — conta e família na mesma tela.' },
  he: { title: 'מעגל המשפחה', subtitle: 'ממלאים פעם אחת — חשבון ומשפחה במסך אחד.' },
  ar: { title: 'دائرة عائلتك', subtitle: 'املأ مرة واحدة — الحساب والأسرة في شاشة واحدة.' },
};
