import React from 'react';
import { Activity, Download, Heart, HeartHandshake, Monitor, Smartphone, Sparkles, Waves } from 'lucide-react';
import type { DiabetesType, Language } from '../../types';
import { BRAND_TAGLINE } from '../../content/landing-copy';
import LanguageSelector from '../LanguageSelector';
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
  languageSectionLabel: string;
  changeLanguageLabel: string;
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
  setLang: (lang: Language) => void;
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

const PILL_COPY: Record<Language, [string, string, string]> = {
  en: ['One calm screen', 'Family at the center', 'Gentle, not noisy'],
  ru: ['Один спокойный экран', 'Семья в центре', 'Мягко, без шума'],
  uk: ['Один спокійний екран', 'Сімʼя в центрі', 'Мʼяко, без шуму'],
  es: ['Una pantalla tranquila', 'La familia primero', 'Suave, sin ruido'],
  fr: ['Un écran apaisant', 'La famille au centre', 'Doux, sans bruit'],
  de: ['Ein ruhiger Bildschirm', 'Familie im Mittelpunkt', 'Sanft, nicht laut'],
  zh: ['一个平静画面', '家庭在中心', '温和，不吵闹'],
  ja: ['落ち着いた一画面', '家族を中心に', 'やさしく、騒がしくない'],
  pt: ['Uma tela calma', 'Família no centro', 'Suave, sem barulho'],
  he: ['מסך רגוע אחד', 'המשפחה במרכז', 'עדין, בלי רעש'],
  ar: ['شاشة هادئة واحدة', 'العائلة في المركز', 'بلطف، بلا ضوضاء'],
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
  languageSectionLabel,
  changeLanguageLabel,
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
  setLang,
}) => {
  const pills = PILL_COPY[lang];
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
            <p className="t1d-footer-kicker">
              <Sparkles size={14} className="inline-block align-[-2px] mr-1" />
              {heroEyebrow}
            </p>
            <p className="t1d-footer-cta-title">{brand}</p>
            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{legalNote}</p>
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
        <div className={`mb-10 flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {pills.map((pill, index) => {
            const Icon = index === 0 ? Heart : index === 1 ? HeartHandshake : Activity;
            return (
              <span key={pill} className={`t1d-footer-pill ${theme === 'dark' ? 't1d-footer-pill--dark' : ''}`}>
                <Icon size={14} />
                {pill}
              </span>
            );
          })}
        </div>

        <div className={`grid grid-cols-1 gap-10 border-b pb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.2fr_0.85fr_0.85fr_0.85fr_0.85fr_0.9fr] ${theme === 'dark' ? 'border-white/10' : 'border-slate-200/80'}`}>
          <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`t1d-brand-mark ${theme === 'dark' ? 't1d-brand-mark--dark' : ''}`}>
                <Heart size={20} />
              </span>
              <div>
                <p className="t1d-eyebrow">{BRAND_TAGLINE[lang]}</p>
                <p className="text-2xl font-extrabold tracking-tight t1d-display">{brand}</p>
              </div>
            </div>
            <p className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{heroEyebrow}</p>
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

        <div className={`mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <p className={`text-[12px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
            {copyright} © 2026 {brand}. {reserved}
          </p>
          <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageSelector
              current={lang}
              onSelect={setLang}
              label={languageSectionLabel}
              buttonLabel={changeLanguageLabel}
              rtl={isRTL}
              dropUp
            />
            <span className="t1d-footer-live">
              <Waves size={12} />
              {activePageLabel}
            </span>
            <span className="opacity-30">•</span>
            <span className={`text-[12px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{heroEyebrow}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
