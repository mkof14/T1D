import React from 'react';
import { HeroIllustration, type HeroIllustrationVariant } from './hero-art/HeroIllustrations';
import type { DiabetesType } from '../../types';

export type PageHeroVariant = HeroIllustrationVariant;

export type PageHeroBannerProps = {
  variant: PageHeroVariant;
  theme: 'light' | 'dark';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  isRTL?: boolean;
  compact?: boolean;
  bleed?: boolean;
  priority?: boolean;
  diabetesType?: DiabetesType | null;
  children?: React.ReactNode;
  className?: string;
};

export const PageHeroBanner: React.FC<PageHeroBannerProps> = ({
  variant,
  theme,
  eyebrow,
  title,
  subtitle,
  isRTL = false,
  compact = false,
  bleed = true,
  priority = false,
  diabetesType = null,
  children,
  className = '',
}) => {
  const shellClass = [
    't1d-page-hero',
    bleed ? 't1d-page-hero--bleed' : '',
    `t1d-page-hero--${variant}`,
    diabetesType ? `t1d-page-hero--${diabetesType}` : '',
    theme === 'dark' ? 't1d-page-hero--dark' : 't1d-page-hero--light',
    compact ? 't1d-page-hero--compact' : '',
    isRTL ? 't1d-page-hero--rtl' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textTone = theme === 'dark' ? 'text-slate-50' : 'text-stone-900';
  const subtitleTone = theme === 'dark' ? 'text-slate-300' : 'text-stone-700';
  const eyebrowClass = theme === 'dark' ? 't1d-soft-label t1d-soft-label--dark' : 't1d-soft-label t1d-soft-label--light';

  return (
    <section className={shellClass} aria-labelledby={`page-hero-${variant}`}>
      <div className="t1d-page-hero__canvas" aria-hidden="true">
        <HeroIllustration variant={variant} theme={theme} priority={priority} diabetesType={diabetesType} />
      </div>
      <div className="t1d-page-hero__fade" aria-hidden="true" />
      <div className={`t1d-page-hero__inner ${isRTL ? 't1d-page-hero__inner--rtl' : ''}`}>
        <div className={`t1d-page-hero__copy ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`t1d-page-hero__copy-panel ${theme === 'dark' ? 't1d-page-hero__copy-panel--dark' : 't1d-page-hero__copy-panel--light'}`}>
            {eyebrow ? <p className={eyebrowClass}>{eyebrow}</p> : null}
            <h1 id={`page-hero-${variant}`} className={`t1d-page-hero__title ${textTone}`}>
              {title}
            </h1>
            {subtitle ? <p className={`t1d-page-hero__subtitle ${subtitleTone}`}>{subtitle}</p> : null}
            {children ? <div className="t1d-page-hero__actions">{children}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
};
