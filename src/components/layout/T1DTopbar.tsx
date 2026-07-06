import React from 'react';
import { Heart } from 'lucide-react';
import type { Language } from '../../types';
import { BRAND_TAGLINE, type CorePage } from '../../content/landing-copy';
import LanguageSelector from '../LanguageSelector';
import ThemeToggle from '../ThemeToggle';
import { MEMBER_PATH_COPY } from '../../content/member-path-copy';
import type { DiabetesType } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dBtnNav } from '../../lib/t1d-ui';

interface T1DTopbarProps {
  lang: Language;
  theme: T1DTheme;
  isRTL: boolean;
  brand: string;
  nav: Record<CorePage, string>;
  headerPages: CorePage[];
  activePage?: CorePage | null;
  accountLabel: string;
  onAccountAction: () => void;
  onBrandClick: () => void;
  onNavigate: (page: CorePage) => void;
  setLang: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  uiCopy: {
    selectLanguage: string;
    changeLanguage: string;
    activateLightMode: string;
    activateDarkMode: string;
    switchToLightMode: string;
    switchToDarkMode: string;
  };
  diabetesType?: DiabetesType | null;
}

export const T1DTopbar: React.FC<T1DTopbarProps> = ({
  lang,
  theme,
  isRTL,
  brand,
  nav,
  headerPages,
  activePage = null,
  accountLabel,
  onAccountAction,
  onBrandClick,
  onNavigate,
  setLang,
  setTheme,
  uiCopy,
  diabetesType = null,
}) => {
  const pathBadge = diabetesType ? MEMBER_PATH_COPY[lang].badge[diabetesType] : null;
  const navButtonClass = t1dBtnNav(theme);

  return (
    <header className={`t1d-topbar ${theme === 'dark' ? 't1d-topbar--dark' : ''}`}>
      <div className={`t1d-container h-16 flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          type="button"
          onClick={onBrandClick}
          className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
        >
          <span className={`t1d-brand-mark ${theme === 'dark' ? 't1d-brand-mark--dark' : ''}`}>
            <Heart size={18} />
          </span>
          <div>
            <p className={`t1d-eyebrow ${theme === 'dark' ? 't1d-eyebrow--dark' : ''}`}>{BRAND_TAGLINE[lang]}</p>
            <p className="text-lg font-black tracking-tight t1d-display">{brand}</p>
          </div>
          {pathBadge ? (
            <span className={`t1d-member-type-badge t1d-member-type-badge--${diabetesType} ${theme === 'dark' ? 't1d-member-type-badge--dark' : ''}`}>
              {pathBadge}
            </span>
          ) : null}
        </button>
        <nav className={`t1d-topbar-nav flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-1 scrollbar-thin md:gap-4 md:justify-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          {headerPages.map((page, index) => (
            <React.Fragment key={page}>
              {index > 0 ? <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}>·</span> : null}
              <button
                type="button"
                onClick={() => onNavigate(page)}
                className={`shrink-0 whitespace-nowrap text-[0.92rem] transition-colors ${
                  activePage === page
                    ? theme === 'dark'
                      ? 'text-amber-200'
                      : 'text-stone-950'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:text-amber-200'
                      : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {nav[page]}
              </button>
            </React.Fragment>
          ))}
        </nav>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <LanguageSelector
            current={lang}
            onSelect={setLang}
            label={uiCopy.selectLanguage}
            buttonLabel={uiCopy.changeLanguage}
            rtl={isRTL}
          />
          <ThemeToggle
            theme={theme}
            toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            activateLightLabel={uiCopy.activateLightMode}
            activateDarkLabel={uiCopy.activateDarkMode}
            switchToLightTitle={uiCopy.switchToLightMode}
            switchToDarkTitle={uiCopy.switchToDarkMode}
          />
          <button type="button" onClick={onAccountAction} className={navButtonClass}>
            {accountLabel}
          </button>
        </div>
      </div>
    </header>
  );
};
