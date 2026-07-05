import { PRODUCT_DESCRIPTION_EN } from '../content/brand';
import { buildAbsoluteUrl } from './site-url';
import { SUPPORTED_LANGUAGES, type Language } from '../types';

const HREFLANG_CODES: Record<Language, string> = {
  en: 'en',
  ru: 'ru',
  uk: 'uk',
  es: 'es',
  fr: 'fr',
  de: 'de',
  zh: 'zh',
  ja: 'ja',
  pt: 'pt',
  he: 'he',
  ar: 'ar',
};

type SeoPayload = {
  title: string;
  description: string;
  path?: string;
  robots?: string;
  imagePath?: string;
  type?: 'website' | 'article';
};

const setMeta = (selector: string, attribute: 'content' | 'href', value: string) => {
  if (typeof document === 'undefined') return;
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

const ensureMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
};

export const applySeo = ({
  title,
  description,
  path = '/',
  robots = 'index,follow',
  imagePath = '/og-image.png',
  type = 'website',
}: SeoPayload) => {
  if (typeof document === 'undefined') return;

  const canonicalUrl = buildAbsoluteUrl(path);
  const imageUrl = buildAbsoluteUrl(imagePath);

  document.title = title;
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[name="robots"]', 'content', robots);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  setMeta('meta[property="og:type"]', 'content', type);
  ensureMeta('meta[property="og:image"]', 'property', 'og:image');
  setMeta('meta[property="og:image"]', 'content', imageUrl);
  ensureMeta('meta[name="twitter:image"]', 'name', 'twitter:image');
  setMeta('meta[name="twitter:image"]', 'content', imageUrl);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('link[rel="canonical"]', 'href', canonicalUrl);
  applyHreflangLinks(path);
};

const applyHreflangLinks = (path: string) => {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('link[rel="alternate"][data-t1d-hreflang]').forEach((node) => node.remove());
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;

  for (const lang of SUPPORTED_LANGUAGES) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = HREFLANG_CODES[lang];
    link.href = buildAbsoluteUrl(canonicalPath);
    link.setAttribute('data-t1d-hreflang', '1');
    document.head.appendChild(link);
  }

  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = buildAbsoluteUrl(canonicalPath);
  defaultLink.setAttribute('data-t1d-hreflang', '1');
  document.head.appendChild(defaultLink);
};

export const applyOrganizationJsonLd = () => {
  if (typeof document === 'undefined') return;

  const scriptId = 't1d-org-jsonld';
  const existing = document.getElementById(scriptId);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Steady',
    url: buildAbsoluteUrl('/'),
    description: PRODUCT_DESCRIPTION_EN,
    logo: buildAbsoluteUrl('/favicon.svg'),
  });
  document.head.appendChild(script);
};
