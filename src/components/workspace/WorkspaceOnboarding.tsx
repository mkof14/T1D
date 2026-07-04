import React from 'react';
import { X } from 'lucide-react';
import type { DiabetesType, Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { WORKSPACE_T2_LABELS } from '../../content/workspace-t2-labels';
import { t1dBtnPrimary, t1dBtnSecondary } from '../../lib/t1d-ui';

const ONBOARDING_KEY = 't1d_workspace_onboarded_v1';

const COPY: Record<Language, { title: string; intro: string; bullets: [string, string, string]; openMeals: string; start: string; skip: string }> = {
  en: {
    title: 'Your workspace in one glance',
    intro: 'Everything you need is on this screen — no extra steps.',
    bullets: [
      'Now — live status, quick actions, and “All clear”.',
      'Meals — camera or photo for carbs, calories, and glucose link.',
      'Timeline, connection, alerts, and family — in the menu.',
    ],
    openMeals: 'Open Meals',
    start: 'Got it',
    skip: 'Skip',
  },
  ru: {
    title: 'Ваше пространство — на одном экране',
    intro: 'Всё необходимое здесь — без лишних шагов.',
    bullets: [
      '«Сейчас» — статус, быстрые действия и «Всё в порядке».',
      '«Еда» — камера или фото: углеводы, калории и связь с глюкозой.',
      'Хронология, связь, сигналы и семья — в меню слева.',
    ],
    openMeals: 'Открыть «Еда»',
    start: 'Понятно',
    skip: 'Пропустить',
  },
  uk: {
    title: 'Ваш простір — на одному екрані',
    intro: 'Усе необхідне тут — без зайвих кроків.',
    bullets: ['«Зараз» — статус і дії.', '«Їжа» — камера та аналіз.', 'Інше — у меню.'],
    openMeals: 'Відкрити «Їжа»',
    start: 'Зрозуміло',
    skip: 'Пропустити',
  },
  es: { title: 'Tu espacio de un vistazo', intro: 'Todo en una pantalla.', bullets: ['Ahora — estado y acciones.', 'Comidas — cámara y análisis.', 'Resto — en el menú.'], openMeals: 'Abrir Comidas', start: 'Entendido', skip: 'Omitir' },
  fr: { title: 'Votre espace en un coup d’œil', intro: 'Tout sur un écran.', bullets: ['Maintenant — statut et actions.', 'Repas — caméra et analyse.', 'Le reste — dans le menu.'], openMeals: 'Ouvrir Repas', start: 'Compris', skip: 'Passer' },
  de: { title: 'Ihr Bereich auf einen Blick', intro: 'Alles auf einem Bildschirm.', bullets: ['Jetzt — Status und Aktionen.', 'Mahlzeiten — Kamera und Analyse.', 'Rest — im Menü.'], openMeals: 'Mahlzeiten öffnen', start: 'Verstanden', skip: 'Überspringen' },
  zh: { title: '工作区一览', intro: '一个屏幕完成所需操作。', bullets: ['现在 — 状态与操作。', '饮食 — 相机与分析。', '其余 — 在菜单中。'], openMeals: '打开饮食', start: '知道了', skip: '跳过' },
  ja: { title: 'ワークスペース概要', intro: '1画面ですべて。', bullets: ['いま — 状態と操作。', '食事 — カメラと分析。', 'その他 — メニュー。'], openMeals: '食事を開く', start: '了解', skip: 'スキップ' },
  pt: { title: 'Seu espaço de relance', intro: 'Tudo em uma tela.', bullets: ['Agora — status e ações.', 'Refeições — câmera e análise.', 'Resto — no menu.'], openMeals: 'Abrir Refeições', start: 'Entendi', skip: 'Pular' },
  he: { title: 'סקירת סביבת העבודה', intro: 'הכול במסך אחד.', bullets: ['עכשיו — סטטוס ופעולות.', 'ארוחות — מצלמה וניתוח.', 'השאר — בתפריט.'], openMeals: 'פתח ארוחות', start: 'הבנתי', skip: 'דלג' },
  ar: { title: 'مساحة العمل بنظرة واحدة', intro: 'كل شيء في شاشة واحدة.', bullets: ['الآن — الحالة والإجراءات.', 'الوجبات — الكامera والتحليل.', 'الباقي — في القائمة.'], openMeals: 'افتح الوجبات', start: 'فهمت', skip: 'تخطي' },
};

export type WorkspaceOnboardingProps = {
  lang: Language;
  theme: T1DTheme;
  diabetesType?: DiabetesType;
  onGoToNutrition?: () => void;
};

export const WorkspaceOnboarding: React.FC<WorkspaceOnboardingProps> = ({ lang, theme, diabetesType = 'type1', onGoToNutrition }) => {
  const [open, setOpen] = React.useState(false);
  const baseCopy = COPY[lang] || COPY.en;
  const copy = diabetesType === 'type2'
    ? { ...baseCopy, bullets: [baseCopy.bullets[0], baseCopy.bullets[1], WORKSPACE_T2_LABELS[lang].onboardingBullet3] as [string, string, string] }
    : baseCopy;

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(ONBOARDING_KEY)) setOpen(true);
  }, []);

  if (!open) return null;

  const finish = () => {
    window.localStorage.setItem(ONBOARDING_KEY, '1');
    setOpen(false);
  };

  return (
    <div className="t1d-onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="t1d-onboarding-title">
      <div className={`t1d-onboarding ${theme === 'dark' ? 't1d-onboarding--dark' : 't1d-onboarding--light'}`}>
        <button type="button" className="t1d-onboarding__close" onClick={finish} aria-label={copy.skip}>
          <X size={18} />
        </button>
        <h3 id="t1d-onboarding-title" className="text-xl font-black tracking-tight">{copy.title}</h3>
        <p className="mt-3 text-sm leading-relaxed opacity-90">{copy.intro}</p>
        <ul className="mt-4 space-y-2">
          {copy.bullets.map((bullet) => (
            <li key={bullet} className="rounded-xl border px-3 py-2 text-sm font-semibold leading-relaxed opacity-90">{bullet}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          {onGoToNutrition ? (
            <button type="button" onClick={() => { finish(); onGoToNutrition(); }} className={t1dBtnPrimary(theme)}>
              {copy.openMeals}
            </button>
          ) : null}
          <button type="button" onClick={finish} className={onGoToNutrition ? t1dBtnSecondary(theme) : t1dBtnPrimary(theme)}>
            {copy.start}
          </button>
        </div>
      </div>
    </div>
  );
};
