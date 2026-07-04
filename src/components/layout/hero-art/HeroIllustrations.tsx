import React from 'react';
import { resolveHeroVariant } from '../../../lib/hero-path';
import type { DiabetesType } from '../../../types';

export type HeroIllustrationVariant =
  | 'home'
  | 'system'
  | 'night'
  | 'family'
  | 'how'
  | 'faq'
  | 'learn'
  | 'news'
  | 'trust'
  | 'privacy'
  | 'terms'
  | 'medical'
  | 'compliance'
  | 'access-signin'
  | 'access-signup'
  | 'setup'
  | 'workspace';

const HERO_IMAGE_SRC: Record<HeroIllustrationVariant, string> = {
  home: '/hero/hero-home.jpg',
  system: '/hero/hero-system.jpg',
  night: '/hero/hero-night.jpg',
  family: '/hero/hero-family.jpg',
  how: '/hero/hero-how.jpg',
  faq: '/hero/hero-faq.jpg',
  learn: '/hero/hero-learn.jpg',
  news: '/hero/hero-news.jpg',
  trust: '/hero/hero-trust.jpg',
  privacy: '/hero/hero-privacy.jpg',
  terms: '/hero/hero-terms.jpg',
  medical: '/hero/hero-medical.jpg',
  compliance: '/hero/hero-compliance.jpg',
  'access-signin': '/hero/hero-access-signin.jpg',
  'access-signup': '/hero/hero-access-signup.jpg',
  setup: '/hero/hero-setup.jpg',
  workspace: '/hero/hero-workspace.jpg',
};

type HeroIllustrationProps = {
  variant: HeroIllustrationVariant;
  theme?: 'light' | 'dark';
  className?: string;
  priority?: boolean;
  diabetesType?: DiabetesType | null;
};

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({
  variant,
  theme = 'light',
  className = '',
  priority = false,
  diabetesType = null,
}) => {
  const resolvedVariant = resolveHeroVariant(variant, diabetesType);
  return (
  <img
    src={HERO_IMAGE_SRC[resolvedVariant]}
    alt=""
    aria-hidden="true"
    decoding="async"
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'}
    className={`t1d-hero-photo ${theme === 'dark' ? 't1d-hero-photo--dark' : ''} ${className}`.trim()}
  />
  );
};
