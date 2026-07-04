import { COPY, buildPagePaths, pageOrder, type CorePage, type Page } from '../content/landing-copy';
import { DOWNLOAD_COPY } from '../content/download-copy';
import { LANDING_TYPE_COPY } from '../content/landing-type-copy';
import { KNOWLEDGE_LABELS } from '../content/knowledge-labels';
import { LEGAL_PAGE_LABELS, LEGAL_PAGE_ORDER, LEGAL_UI_COPY } from '../content/legal-labels';
import type { Language } from '../types';
import { DOWNLOAD_ARTIFACTS } from './download-artifacts';

export const buildPublicSiteChrome = (lang: Language, basePath?: string) => {
  const copy = COPY[lang];
  const typeCopy = LANDING_TYPE_COPY[lang];
  const legalLabels = LEGAL_PAGE_LABELS[lang];
  const legalUi = LEGAL_UI_COPY[lang];
  const knowledgeLabels = KNOWLEDGE_LABELS.footer[lang];
  const knowledgePageLabels = KNOWLEDGE_LABELS.pages[lang];
  const pagePaths = buildPagePaths(basePath);
  const headerPages = pageOrder.filter((page) => page !== 'trust') as CorePage[];
  const footerProductLinks = pageOrder.map((page) => ({ id: page, label: copy.nav[page] }));
  const footerKnowledgeLinks = [
    { id: 'how', label: knowledgeLabels.how },
    { id: 'faq', label: knowledgeLabels.faq },
    { id: 'learn', label: knowledgeLabels.learn },
    { id: 'news', label: knowledgeLabels.news },
  ];
  const footerLegalLinks = LEGAL_PAGE_ORDER.map((page) => ({ id: page, label: legalLabels[page] }));
  const downloadCopy = DOWNLOAD_COPY[lang];
  const footerDownloadLinks = [
    {
      id: 'downloadDesktop',
      label: downloadCopy.footerDesktop,
      href: DOWNLOAD_ARTIFACTS.desktopWindows,
      downloadFilename: 'Steady Desktop.url',
      isFileDownload: true,
      pageHref: pagePaths.downloadDesktop,
    },
    {
      id: 'downloadMobile',
      label: downloadCopy.footerMobile,
      href: DOWNLOAD_ARTIFACTS.mobileHtml,
      downloadFilename: 'Steady Mobile.html',
      isFileDownload: true,
      pageHref: pagePaths.downloadMobile,
    },
  ];

  const resolveActivePageLabel = (page: Page) => {
    if (page === 'how') return knowledgeLabels.how;
    if (page === 'faq') return knowledgeLabels.faq;
    if (page === 'learn') return knowledgeLabels.learn;
    if (page === 'news') return knowledgeLabels.news;
    if (page === 'privacy') return legalLabels.privacy;
    if (page === 'terms') return legalLabels.terms;
    if (page === 'medical') return legalLabels.medical;
    if (page === 'compliance') return legalLabels.compliance;
    if (page === 'trust') return legalLabels.trust;
    if (page === 'downloadDesktop') return downloadCopy.footerDesktop;
    if (page === 'downloadMobile') return downloadCopy.footerMobile;
    return copy.titleByPage[page as CorePage];
  };

  const navigateToPublicPage = (pageId: string) => {
    if (typeof window === 'undefined') return;
    const path = pagePaths[pageId as Page] || '/';
    window.history.pushState({}, '', path);
  };

  return {
    copy,
    typeCopy,
    legalUi,
    legalLabels,
    knowledgePageLabels,
    pagePaths,
    headerPages,
    footerProductLinks,
    footerKnowledgeLinks,
    footerLegalLinks,
    footerDownloadLinks,
    downloadSectionLabel: downloadCopy.footerSection,
    resolveActivePageLabel,
    navigateToPublicPage,
  };
};
