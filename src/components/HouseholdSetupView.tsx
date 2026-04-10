import React, { useState } from 'react';
import { joinHousehold, saveHousehold, type HouseholdProfile } from '../lib/api';
import { ROLE_LABELS, RTL_LANGUAGES, type Language, type UserRole } from '../types';

interface HouseholdSetupViewProps {
  lang: Language;
  theme: 'light' | 'dark';
  role: UserRole;
  fullName: string;
  onComplete: (household: HouseholdProfile) => void;
}

const COPY: Record<Language, {
  eyebrow: string;
  title: string;
  subtitle: string;
  save: string;
  working: string;
  fields: Record<'householdName' | 'childName' | 'childAgeBand' | 'primaryParent' | 'caregiverName' | 'nightWindow', string>;
  placeholders: Record<'householdName' | 'childName' | 'childAgeBand' | 'primaryParent' | 'caregiverName' | 'nightWindow', string>;
}> = {
  en: {
    eyebrow: 'Family Setup',
    title: 'Set up your family support circle',
    subtitle: 'Add the child, parent, support adult, and night window before support starts.',
    save: 'Save Family',
    working: 'Saving...',
    fields: {
      householdName: 'Family Name',
      childName: 'Child Name',
      childAgeBand: 'Child Age Band',
      primaryParent: 'Primary Parent',
      caregiverName: 'Backup Support Adult',
      nightWindow: 'Night Window',
    },
    placeholders: {
      householdName: 'Mila Support Circle',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '10:00 PM - 7:00 AM',
    },
  },
  ru: {
    eyebrow: 'Настройка Семьи',
    title: 'Соберите семейный круг поддержки',
    subtitle: 'Сначала задайте ребёнка, родителя, помогающего взрослого и ночное окно, а уже потом запускайте поддержку.',
    save: 'Сохранить Семью',
    working: 'Сохранение...',
    fields: {
      householdName: 'Название Семьи',
      childName: 'Имя Ребёнка',
      childAgeBand: 'Возраст Ребёнка',
      primaryParent: 'Основной Родитель',
      caregiverName: 'Резервный Помогающий Взрослый',
      nightWindow: 'Ночное Окно',
    },
    placeholders: {
      householdName: 'Ночной Круг Милы',
      childName: 'Мила',
      childAgeBand: '8-12',
      primaryParent: 'Анна Ривера',
      caregiverName: 'Джордан Ли',
      nightWindow: '22:00 - 07:00',
    },
  },
  uk: {
    eyebrow: 'Налаштування Сімʼї',
    title: 'Зберіть сімейне коло підтримки',
    subtitle: 'Спочатку задайте дитину, батьків, дорослого для підтримки та нічне вікно, а вже потім запускайте підтримку.',
    save: 'Зберегти Сімʼю',
    working: 'Збереження...',
    fields: {
      householdName: 'Назва Сімʼї',
      childName: 'Імʼя Дитини',
      childAgeBand: 'Вік Дитини',
      primaryParent: 'Основний З Батьків',
      caregiverName: 'Резервний Дорослий Для Підтримки',
      nightWindow: 'Нічне Вікно',
    },
    placeholders: {
      householdName: 'Нічне Коло Міли',
      childName: 'Міла',
      childAgeBand: '8-12',
      primaryParent: 'Анна Рівера',
      caregiverName: 'Джордан Лі',
      nightWindow: '22:00 - 07:00',
    },
  },
  es: {
    eyebrow: 'Configuración Familiar',
    title: 'Crea el círculo de apoyo familiar',
    subtitle: 'Configura al niño, al progenitor, al adulto de apoyo y la franja de noche antes de empezar.',
    save: 'Guardar Familia',
    working: 'Guardando...',
    fields: {
      householdName: 'Nombre Del Hogar',
      childName: 'Nombre Del Niño',
      childAgeBand: 'Edad Del Niño',
      primaryParent: 'Progenitor Principal',
      caregiverName: 'Adulto De Apoyo',
      nightWindow: 'Franja De Noche',
    },
    placeholders: {
      householdName: 'Círculo De Apoyo De Mila',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '10:00 PM - 7:00 AM',
    },
  },
  fr: {
    eyebrow: 'Configuration Du Foyer',
    title: 'Créez le cercle de soutien familial',
    subtitle: 'Configurez l’enfant, le parent, l’adulte de soutien et la plage de nuit avant de commencer.',
    save: 'Enregistrer Le Foyer',
    working: 'Enregistrement...',
    fields: {
      householdName: 'Nom Du Foyer',
      childName: 'Nom De L’Enfant',
      childAgeBand: 'Âge De L’Enfant',
      primaryParent: 'Parent Principal',
      caregiverName: 'Adulte De Soutien',
      nightWindow: 'Plage De Nuit',
    },
    placeholders: {
      householdName: 'Cercle De Soutien De Mila',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '22:00 - 07:00',
    },
  },
  de: {
    eyebrow: 'Haushalts-Setup',
    title: 'Richten Sie den Familienkreis ein',
    subtitle: 'Richten Sie Kind, Elternteil, unterstützende Person und Nachtzeit ein, bevor die Unterstützung beginnt.',
    save: 'Familie Speichern',
    working: 'Wird gespeichert...',
    fields: {
      householdName: 'Familienname',
      childName: 'Name Des Kindes',
      childAgeBand: 'Altersgruppe Des Kindes',
      primaryParent: 'Hauptelternteil',
      caregiverName: 'Unterstützende Person',
      nightWindow: 'Nachtzeit',
    },
    placeholders: {
      householdName: 'Milas Unterstützungskreis',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '22:00 - 07:00',
    },
  },
  zh: {
    eyebrow: '家庭设置',
    title: '建立家庭支持圈',
    subtitle: '先配置孩子、家长、支持的大人和夜间时间段，然后再开始支持。',
    save: '保存家庭',
    working: '正在保存...',
    fields: {
      householdName: '家庭名称',
      childName: '孩子姓名',
      childAgeBand: '孩子年龄段',
      primaryParent: '主要家长',
      caregiverName: '支持的大人',
      nightWindow: '夜间时间段',
    },
    placeholders: {
      householdName: 'Mila 家庭支持圈',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '晚上10点 - 早上7点',
    },
  },
  ja: {
    eyebrow: '家族設定',
    title: '家族の支援サークルを作る',
    subtitle: '子ども、保護者、支える大人、夜の時間帯を設定してから始めます。',
    save: '家族を保存',
    working: '保存中...',
    fields: {
      householdName: '家族名',
      childName: '子どもの名前',
      childAgeBand: '子どもの年齢帯',
      primaryParent: '主担当の保護者',
      caregiverName: '支える大人',
      nightWindow: '夜の時間帯',
    },
    placeholders: {
      householdName: 'Mila サポートサークル',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '22:00 - 07:00',
    },
  },
  pt: {
    eyebrow: 'Configuração Da Família',
    title: 'Monte o círculo de apoio da família',
    subtitle: 'Configure a criança, o responsável, o adulto de apoio e a janela da noite antes de começar.',
    save: 'Salvar Família',
    working: 'Salvando...',
    fields: {
      householdName: 'Nome Da Família',
      childName: 'Nome Da Criança',
      childAgeBand: 'Faixa Etária Da Criança',
      primaryParent: 'Responsável Principal',
      caregiverName: 'Adulto De Apoio',
      nightWindow: 'Janela Noturna',
    },
    placeholders: {
      householdName: 'Círculo De Apoio Da Mila',
      childName: 'Mila',
      childAgeBand: '8-12',
      primaryParent: 'Anna Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '22:00 - 07:00',
    },
  },
  he: {
    eyebrow: 'הגדרת משפחה',
    title: 'בנו את מעגל התמיכה המשפחתי',
    subtitle: 'הגדירו את הילד, ההורה, המבוגר התומך וחלון הלילה לפני שמתחילים.',
    save: 'שמור משפחה',
    working: 'שומר...',
    fields: {
      householdName: 'שם המשפחה',
      childName: 'שם הילד',
      childAgeBand: 'טווח גיל הילד',
      primaryParent: 'הורה ראשי',
      caregiverName: 'מבוגר תומך',
      nightWindow: 'חלון לילה',
    },
    placeholders: {
      householdName: 'מעגל התמיכה של מילה',
      childName: 'מילה',
      childAgeBand: '8-12',
      primaryParent: 'אנה ריברה',
      caregiverName: 'ג׳ורדן לי',
      nightWindow: '22:00 - 07:00',
    },
  },
  ar: {
    eyebrow: 'إعداد العائلة',
    title: 'ابنِ دائرة الدعم العائلية',
    subtitle: 'قم بإعداد الطفل وولي الأمر والشخص البالغ الداعم ونافذة الليل قبل البدء.',
    save: 'حفظ العائلة',
    working: 'جار الحفظ...',
    fields: {
      householdName: 'اسم العائلة',
      childName: 'اسم الطفل',
      childAgeBand: 'الفئة العمرية للطفل',
      primaryParent: 'ولي الأمر الأساسي',
      caregiverName: 'شخص بالغ داعم',
      nightWindow: 'نافذة الليل',
    },
    placeholders: {
      householdName: 'دائرة دعم ميلا',
      childName: 'ميلا',
      childAgeBand: '8-12',
      primaryParent: 'آنا ريفيرا',
      caregiverName: 'جوردان لي',
      nightWindow: '10:00 م - 7:00 ص',
    },
  },
};

const tone =
  'h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900';

const FLOW_COPY: Record<Language, {
  create: string;
  join: string;
  joinTitle: string;
  joinSubtitle: string;
  inviteCode: string;
  invitePlaceholder: string;
  joinAction: string;
}> = {
  en: { create: 'Create Family', join: 'Join Family', joinTitle: 'Join an existing family circle', joinSubtitle: 'Use the invite code from the family so this account joins the same family.', inviteCode: 'Invite Code', invitePlaceholder: 'AB12CD', joinAction: 'Join With Code' },
  ru: { create: 'Создать Семью', join: 'Присоединиться', joinTitle: 'Присоединитесь к существующей семье', joinSubtitle: 'Используйте код приглашения от семьи, чтобы этот аккаунт вошёл в ту же семью.', inviteCode: 'Код Приглашения', invitePlaceholder: 'AB12CD', joinAction: 'Войти По Коду' },
  uk: { create: 'Створити Сімʼю', join: 'Приєднатися', joinTitle: 'Приєднайтесь до наявної сімʼї', joinSubtitle: 'Використайте код запрошення від сімʼї, щоб цей акаунт увійшов у ту саму сімʼю.', inviteCode: 'Код Запрошення', invitePlaceholder: 'AB12CD', joinAction: 'Увійти За Кодом' },
  es: { create: 'Crear Familia', join: 'Unirse', joinTitle: 'Únete a un círculo familiar existente', joinSubtitle: 'Usa el código de invitación de la familia para que esta cuenta entre al mismo hogar.', inviteCode: 'Código De Invitación', invitePlaceholder: 'AB12CD', joinAction: 'Unirse Con Código' },
  fr: { create: 'Créer Le Foyer', join: 'Rejoindre', joinTitle: 'Rejoindre un foyer existant', joinSubtitle: 'Utilisez le code d’invitation de la famille pour que ce compte rejoigne le même foyer.', inviteCode: 'Code D’Invitation', invitePlaceholder: 'AB12CD', joinAction: 'Rejoindre Avec Le Code' },
  de: { create: 'Haushalt Erstellen', join: 'Beitreten', joinTitle: 'Einem bestehenden Haushalt beitreten', joinSubtitle: 'Verwenden Sie den Einladungscode der Familie, damit dieses Konto demselben Haushalt beitritt.', inviteCode: 'Einladungscode', invitePlaceholder: 'AB12CD', joinAction: 'Mit Code Beitreten' },
  zh: { create: '创建家庭', join: '加入家庭', joinTitle: '加入已有家庭', joinSubtitle: '使用家人提供的邀请码，让这个账号加入同一个家庭。', inviteCode: '邀请码', invitePlaceholder: 'AB12CD', joinAction: '使用邀请码加入' },
  ja: { create: '家族を作成', join: '家族に参加', joinTitle: '既存の家族に参加する', joinSubtitle: '家族から受け取った招待コードを使って、このアカウントを同じ家族に参加させます。', inviteCode: '招待コード', invitePlaceholder: 'AB12CD', joinAction: 'コードで参加' },
  pt: { create: 'Criar Família', join: 'Entrar', joinTitle: 'Entrar em uma família existente', joinSubtitle: 'Use o código de convite da família para que esta conta entre na mesma família.', inviteCode: 'Código De Convite', invitePlaceholder: 'AB12CD', joinAction: 'Entrar Com Código' },
  he: { create: 'צור משפחה', join: 'הצטרף', joinTitle: 'הצטרפות למשפחה קיימת', joinSubtitle: 'השתמשו בקוד ההזמנה מהמשפחה כדי שהחשבון הזה יצטרף לאותה משפחה.', inviteCode: 'קוד הזמנה', invitePlaceholder: 'AB12CD', joinAction: 'הצטרף עם קוד' },
  ar: { create: 'إنشاء العائلة', join: 'الانضمام', joinTitle: 'الانضمام إلى عائلة موجودة', joinSubtitle: 'استخدم رمز الدعوة من العائلة حتى ينضم هذا الحساب إلى العائلة نفسها.', inviteCode: 'رمز الدعوة', invitePlaceholder: 'AB12CD', joinAction: 'الانضمام عبر الرمز' },
};

export const HouseholdSetupView: React.FC<HouseholdSetupViewProps> = ({ lang, theme, role, fullName, onComplete }) => {
  const copy = COPY[lang];
  const flowCopy = FLOW_COPY[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const roleName = ROLE_LABELS[lang][role];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flow, setFlow] = useState<'create' | 'join'>(role === 'caregiver' ? 'join' : 'create');
  const [inviteCode, setInviteCode] = useState('');
  const [form, setForm] = useState({
    householdName: copy.placeholders.householdName,
    childName: role === 'child' ? fullName : copy.placeholders.childName,
    childAgeBand: copy.placeholders.childAgeBand,
    primaryParent: role === 'parent' ? fullName : copy.placeholders.primaryParent,
    caregiverName: role === 'caregiver' ? fullName : copy.placeholders.caregiverName,
    nightWindow: copy.placeholders.nightWindow,
  });

  const setField = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = flow === 'join' ? await joinHousehold({ inviteCode }) : await saveHousehold(form);
      onComplete(response.household);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${theme === 'dark' ? 'bg-[#09111a] text-slate-100' : 'bg-[#f3f8fb] text-slate-900'}`}>
      <div className="mx-auto max-w-[980px] px-4 py-8 md:px-6 md:py-10">
        <section className={`rounded-[2.2rem] border p-7 md:p-9 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/96'} ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:text-sky-300">{copy.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {flow === 'join' ? flowCopy.joinSubtitle : `${copy.subtitle} ${roleName}.`}
          </p>

          <div className={`mt-8 flex flex-wrap gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <button
              type="button"
              onClick={() => setFlow('create')}
              className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${
                flow === 'create'
                  ? theme === 'dark' ? 'bg-sky-300 text-slate-950' : 'bg-slate-950 text-white'
                  : theme === 'dark' ? 'border border-slate-700 bg-slate-950 text-slate-200' : 'border border-slate-300 bg-white text-slate-700'
              }`}
            >
              {flowCopy.create}
            </button>
            <button
              type="button"
              onClick={() => setFlow('join')}
              className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${
                flow === 'join'
                  ? theme === 'dark' ? 'bg-sky-300 text-slate-950' : 'bg-slate-950 text-white'
                  : theme === 'dark' ? 'border border-slate-700 bg-slate-950 text-slate-200' : 'border border-slate-300 bg-white text-slate-700'
              }`}
            >
              {flowCopy.join}
            </button>
          </div>

          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            {flow === 'join' ? (
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{flowCopy.inviteCode}</label>
                <input
                  className={`${tone} ${isRTL ? 'text-right' : 'text-left'}`}
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  placeholder={flowCopy.invitePlaceholder}
                />
              </div>
            ) : (
              (Object.keys(copy.fields) as Array<keyof typeof copy.fields>).map((key) => (
                <div key={key} className={key === 'householdName' ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
                  <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{copy.fields[key]}</label>
                  <input
                    className={`${tone} ${isRTL ? 'text-right' : 'text-left'}`}
                    value={form[key]}
                    onChange={(event) => setField(key, event.target.value)}
                    placeholder={copy.placeholders[key]}
                  />
                </div>
              ))
            )}

            {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 md:col-span-2">{error}</p> : null}

            <div className={`md:col-span-2 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                type="submit"
                disabled={busy}
                className={`rounded-full px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${
                  theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-slate-950 text-white hover:bg-slate-800'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {busy ? copy.working : flow === 'join' ? flowCopy.joinAction : copy.save}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HouseholdSetupView;
