import React from 'react';
import type { DiabetesType, Language } from '../../types';
import { buildPublicSiteChrome } from '../../lib/public-site-chrome';
import { memberLayoutTypeClass, memberShellTypeClass, typeAccentBarClass } from '../../lib/diabetes-type-theme';
import { T1DPageBackdrop } from './T1DPageBackdrop';
import { T1DFooter } from './T1DFooter';
import { T1DTopbar } from './T1DTopbar';
import { DiabetesTypeRibbon } from './DiabetesTypeRibbon';
import type { T1DTheme } from '../../lib/t1d-ui';

interface MemberZoneShellProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: T1DTheme;
  setTheme: (theme: 'light' | 'dark') => void;
  isRTL: boolean;
  diabetesType?: DiabetesType | null;
  activePageLabel: string;
  accountLabel: string;
  onAccountAction: () => void;
  onBackToPublic: () => void;
  onSignUp: (type: DiabetesType) => void;
  children: React.ReactNode;
}

export const MemberZoneShell: React.FC<MemberZoneShellProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  isRTL,
  diabetesType = null,
  activePageLabel,
  accountLabel,
  onAccountAction,
  onBackToPublic,
  onSignUp,
  children,
}) => {
  const chrome = buildPublicSiteChrome(lang);
  const shellTone = theme === 'dark' ? 't1d-page-shell t1d-page-shell--dark text-slate-100' : 't1d-page-shell text-slate-900';

  const goPublic = (pageId: string) => {
    chrome.navigateToPublicPage(pageId);
    onBackToPublic();
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen w-full relative flex flex-col ${shellTone} ${memberShellTypeClass(diabetesType)} ${isRTL ? 'text-right' : 'text-left'}`}>
      <T1DPageBackdrop theme={theme} diabetesType={diabetesType} />
      <div className={typeAccentBarClass(diabetesType, theme)} />
      {diabetesType ? <DiabetesTypeRibbon lang={lang} theme={theme} diabetesType={diabetesType} isRTL={isRTL} /> : null}
      <T1DTopbar
        lang={lang}
        theme={theme}
        isRTL={isRTL}
        brand={chrome.copy.brand}
        nav={chrome.copy.nav}
        headerPages={chrome.headerPages}
        accountLabel={accountLabel}
        onAccountAction={onAccountAction}
        onBrandClick={onBackToPublic}
        onNavigate={(page) => goPublic(page)}
        setLang={setLang}
        setTheme={setTheme}
        uiCopy={chrome.copy.ui}
        diabetesType={diabetesType}
      />
      <main className={`t1d-container relative z-10 flex-1 pt-4 md:pt-5 pb-10 ${memberLayoutTypeClass(diabetesType)}`}>
        {children}
      </main>
      <T1DFooter
        lang={lang}
        theme={theme}
        isRTL={isRTL}
        brand={chrome.copy.brand}
        heroEyebrow={chrome.copy.hero.eyebrow}
        signInLabel={chrome.copy.signIn}
        type1SignUpLabel={chrome.typeCopy.home.type1.cta}
        type2SignUpLabel={chrome.typeCopy.home.type2.cta}
        activePageLabel={activePageLabel}
        copyright={chrome.legalUi.copyright}
        reserved={chrome.legalUi.reserved}
        disclaimer={chrome.copy.footer.disclaimer}
        accountLabel={chrome.copy.footer.accountLabel}
        activateLightLabel={chrome.copy.ui.activateLightMode}
        activateDarkLabel={chrome.copy.ui.activateDarkMode}
        switchToLightTitle={chrome.copy.ui.switchToLightMode}
        switchToDarkTitle={chrome.copy.ui.switchToDarkMode}
        sectionProduct={chrome.copy.footerSections.product}
        sectionExplore={chrome.knowledgePageLabels.explore}
        sectionLegal={chrome.copy.footerSections.legal}
        sectionDownload={chrome.downloadSectionLabel}
        sectionAccount={chrome.copy.footerSections.account}
        legalNote={chrome.legalUi.classicNote}
        trustLegalLabel={chrome.copy.footer.legal}
        productLinks={chrome.footerProductLinks}
        knowledgeLinks={chrome.footerKnowledgeLinks}
        legalLinks={chrome.footerLegalLinks}
        downloadLinks={chrome.footerDownloadLinks}
        onNavigate={goPublic}
        onSignIn={onAccountAction}
        onSignUp={onSignUp}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
    </div>
  );
};
