import type { HeroIllustrationVariant } from '../components/layout/hero-art/HeroIllustrations';
import type { Page } from '../content/landing-copy';

/** Hero art variant for each public page topic. */
export const PAGE_TOPIC_HERO: Partial<Record<Page, HeroIllustrationVariant>> = {
  home: 'home',
  system: 'system',
  night: 'night',
  family: 'family',
  how: 'how',
  faq: 'faq',
  learn: 'learn',
  news: 'news',
  trust: 'trust',
  privacy: 'privacy',
  terms: 'terms',
  medical: 'medical',
  compliance: 'compliance',
  downloadDesktop: 'workspace',
  downloadMobile: 'compliance',
};

export const resolvePageTopicHero = (page: Page): HeroIllustrationVariant =>
  PAGE_TOPIC_HERO[page] ?? 'home';
