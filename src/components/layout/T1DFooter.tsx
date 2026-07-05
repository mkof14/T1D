import React from 'react';
import { Download, Heart, Monitor, Smartphone } from 'lucide-react';
import type { DiabetesType, Language } from '../../types';
import ThemeToggle from '../ThemeToggle';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dBtnPrimary, t1dBtnSecondary } from '../../lib/t1d-ui';
import {
  DOWNLOAD_ARTIFACTS,
  resolveDesktopDownloadHref,
  resolveDesktopDownloadName,
  triggerFileDownload,
} from '../../lib/download-artifacts';

interface FooterLink {
  id: string;
  label: string;
  href?: string;
  pageHref?: string;
  downloadFilename?: string;
  isFileDownload?: boolean;
}

interface T1DFooterProps {
  lang: Language;
  theme: T1DTheme;
  isRTL: boolean;
  brand: string;
  heroEyebrow: string;
  signInLabel: string;
  type1SignUpLabel: string;
  type2SignUpLabel: string;
  activePageLabel: string;
  copyright: string;
  reserved: string;
  disclaimer: string;
  accountLabel: string;
  activateLightLabel: string;
  activateDarkLabel: string;
  switchToLightTitle: string;
  switchToDarkTitle: string;
  sectionProduct: string;
  sectionExplore: string;
  sectionLegal: string;
  sectionDownload: string;
  sectionAccount: string;
  legalNote: string;
  trustLegalLabel: string;
  productLinks: FooterLink[];
  knowledgeLinks: FooterLink[];
  legalLinks: FooterLink[];
  downloadLinks: FooterLink[];
  onNavigate: (pageId: string) => void;
  onSignIn: () => void;
  onSignUp: (type: DiabetesType) => void;
  onToggleTheme: () => void;
}

const FOOTER_PWA_COPY: Record<Language, string> = {
  en: 'PWA manifest',
  ru: 'PWA-манифест',
  uk: 'PWA-маніфест',
  es: 'Manifiesto PWA',
  fr: 'Manifeste PWA',
  de: 'PWA-Manifest',
  zh: 'PWA 清单',
  ja: 'PWAマニフェスト',
  pt: 'Manifesto PWA',
  he: 'מניפסט PWA',
  ar: 'بيان PWA',
};

export const T1DFooter: React.FC<T1DFooterProps> = ({
  lang,
  theme,
  isRTL,
  brand,
  heroEyebrow,
  signInLabel,
  type1SignUpLabel,
  type2SignUpLabel,
  activePageLabel,
  copyright,
  reserved,
  disclaimer,
  accountLabel,
  activateLightLabel,
  activateDarkLabel,
  switchToLightTitle,
  switchToDarkTitle,
  sectionProduct,
  sectionExplore,
  sectionLegal,
  sectionDownload,
  sectionAccount,
  legalNote,
  trustLegalLabel,
  productLinks,
  knowledgeLinks,
  legalLinks,
  downloadLinks,
  onNavigate,
  onSignIn,
  onSignUp,
  onToggleTheme,
}) => {
  const footerNavClass = `t1d-footer-link ${isRTL ? 'text-right' : 'text-left'}`;

  const handleDownloadClick = (page: FooterLink) => {
    if (!page.isFileDownload || !page.href || !page.downloadFilename) return;
    const href = page.id === 'downloadDesktop' ? resolveDesktopDownloadHref() : page.href;
    const filename = page.id === 'downloadDesktop' ? resolveDesktopDownloadName(href) : page.downloadFilename;
    triggerFileDownload(href, filename);
    if (page.pageHref) {
      onNavigate(page.id);
    }
  };

  return (
    <footer className={`t1d-footer ${theme === 'dark' ? 't1d-footer--dark' : ''}`}>
      <div className="t1d-footer-shimmer" aria-hidden="true" />
      <div className="t1d-footer-glow t1d-footer-glow-a" aria-hidden="true" />
      <div className="t1d-footer-glow t1d-footer-glow-b" aria-hidden="true" />

      <div className={`t1d-footer-cta ${theme === 'dark' ? 't1d-footer-cta--dark' : ''}`}>
        <div className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="t1d-footer-cta-title">{brand}</p>
          </div>
          <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" onClick={onSignIn} className={t1dBtnSecondary(theme)}>
              {signInLabel}
            </button>
            <button type="button" onClick={() => onSignUp('type1')} className={t1dBtnPrimary(theme)}>
              {type1SignUpLabel}
            </button>
            <button type="button" onClick={() => onSignUp('type2')} className={t1dBtnPrimary(theme)}>
              {type2SignUpLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="t1d-container relative z-10 py-12 md:py-14">
        <div className={`grid grid-cols-1 gap-10 border-b pb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.2fr_0.85fr_0.85fr_0.85fr_0.85fr_0.9fr] ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
          <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`t1d-brand-mark ${theme === 'dark' ? 't1d-brand-mark--dark' : ''}`}>
                <Heart size={18} />
              </span>
              <p className="text-2xl font-extrabold tracking-tight t1d-display">{brand}</p>
            </div>
            <p className={`max-w-md text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{disclaimer}</p>
          </div>

          <nav className="space-y-4">
            <p className="t1d-footer-section-title">{sectionProduct}</p>
            <div className="flex flex-col gap-3">
              {productLinks.map((page) => (
                <button key={page.id} type="button" onClick={() => onNavigate(page.id)} className={footerNavClass}>
                  {page.label}
                </button>
              ))}
            </div>
          </nav>

          <nav className="space-y-4">
            <p className="t1d-footer-section-title">{sectionExplore}</p>
            <div className="flex flex-col gap-3">
              {knowledgeLinks.map((page) => (
                <button key={page.id} type="button" onClick={() => onNavigate(page.id)} className={footerNavClass}>
                  {page.label}
                </button>
              ))}
            </div>
          </nav>

          <nav className="space-y-4">
            <p className="t1d-footer-section-title">{sectionLegal}</p>
            <div className="flex flex-col gap-3">
              {legalLinks.map((page) => (
                <button key={page.id} type="button" onClick={() => onNavigate(page.id)} className={footerNavClass}>
                  {page.label}
                </button>
              ))}
            </div>
          </nav>

          <nav className="space-y-4">
            <p className="t1d-footer-section-title">{sectionDownload}</p>
            <div className="flex flex-col gap-3">
              {downloadLinks.map((page) => {
                const Icon =
                  page.id === 'downloadDesktop' ? Monitor : page.id === 'downloadMobile' ? Smartphone : Download;
                if (page.isFileDownload && page.href && page.downloadFilename) {
                  return (
                    <a
                      key={page.id}
                      href={page.id === 'downloadDesktop' ? resolveDesktopDownloadHref() : page.href}
                      download={page.id === 'downloadDesktop' ? resolveDesktopDownloadName(resolveDesktopDownloadHref()) : page.downloadFilename}
                      onClick={(event) => {
                        event.preventDefault();
                        handleDownloadClick(page);
                      }}
                      className={`${footerNavClass} inline-flex items-center gap-2`}
                    >
                      <Icon size={14} />
                      {page.label}
                    </a>
                  );
                }
                return (
                  <button key={page.id} type="button" onClick={() => onNavigate(page.id)} className={`${footerNavClass} inline-flex items-center gap-2`}>
                    <Icon size={14} />
                    {page.label}
                  </button>
                );
              })}
            </div>
            <a
              href={DOWNLOAD_ARTIFACTS.pwaManifest}
              download="steady.webmanifest"
              className="t1d-footer-download-badge"
            >
              <Download size={12} />
              {FOOTER_PWA_COPY[lang]}
            </a>
          </nav>

          <div className="space-y-4">
            <p className="t1d-footer-section-title">{sectionAccount}</p>
            <div className="space-y-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`text-[13px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{accountLabel}</span>
                <ThemeToggle
                  theme={theme}
                  toggle={onToggleTheme}
                  activateLightLabel={activateLightLabel}
                  activateDarkLabel={activateDarkLabel}
                  switchToLightTitle={switchToLightTitle}
                  switchToDarkTitle={switchToDarkTitle}
                />
              </div>
              <p className={`text-[13px] leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{trustLegalLabel}</p>
            </div>
          </div>
        </div>

        <div className={`mt-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {copyright} © 2026 {brand}. {reserved}
          </p>
        </div>
      </div>
    </footer>
  );
};
