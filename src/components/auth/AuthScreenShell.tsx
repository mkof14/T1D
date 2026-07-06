import React from 'react';
import type { DiabetesType, Language } from '../../types';
import { DIABETES_TYPE_COPY, diabetesTypeKey } from '../../content/diabetes-type-copy';
import { LanguageSelector } from '../LanguageSelector';
import { typeAccentBarClass } from '../../lib/diabetes-type-theme';
import { t1dBtnGhost, type T1DTheme } from '../../lib/t1d-ui';

interface AuthScreenShellProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: T1DTheme;
  setTheme: (theme: 'light' | 'dark') => void;
  diabetesType?: DiabetesType | null;
  isRTL: boolean;
  onBack?: () => void;
  backLabel?: string;
  children: React.ReactNode;
}

export const AuthScreenShell: React.FC<AuthScreenShellProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  diabetesType = null,
  isRTL,
  onBack,
  backLabel,
  children,
}) => {
  const shellClass = theme === 'dark'
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-screen bg-orange-50/40 text-slate-900';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`${shellClass} relative flex flex-col`}>
      {diabetesType ? <div className={typeAccentBarClass(diabetesType, theme)} /> : null}
      <div className={`flex items-center justify-between gap-3 px-4 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {onBack ? (
          <button type="button" onClick={onBack} className={t1dBtnGhost(theme)}>
            {backLabel || '←'}
          </button>
        ) : <span />}
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <LanguageSelector
            current={lang}
            onSelect={setLang}
            label={lang === 'ru' ? 'Язык' : 'Language'}
            buttonLabel={lang === 'ru' ? 'Язык' : 'Language'}
            rtl={isRTL}
          />
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={t1dBtnGhost(theme)}
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          {diabetesType ? (
            <p className={`mb-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {DIABETES_TYPE_COPY[lang][diabetesTypeKey(diabetesType)].label}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
};
