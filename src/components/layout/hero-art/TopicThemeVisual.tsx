import React from 'react';
import { HeroIllustration, type HeroIllustrationVariant } from './HeroIllustrations';
import type { DiabetesType } from '../../../types';

type TopicThemeVisualProps = {
  variant: HeroIllustrationVariant;
  theme: 'light' | 'dark';
  diabetesType?: DiabetesType | null;
  priority?: boolean;
  className?: string;
  frame?: 'banner' | 'card' | 'strip';
};

export const TopicThemeVisual: React.FC<TopicThemeVisualProps> = ({
  variant,
  theme,
  diabetesType = null,
  priority = false,
  className = '',
  frame = 'card',
}) => {
  const shellClass = [
    't1d-topic-visual',
    `t1d-topic-visual--${frame}`,
    `t1d-topic-visual--${variant}`,
    theme === 'dark' ? 't1d-topic-visual--dark' : 't1d-topic-visual--light',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass} aria-hidden="true">
      <HeroIllustration variant={variant} theme={theme} diabetesType={diabetesType} priority={priority} />
      <div className="t1d-topic-visual__fade" />
    </div>
  );
};

type TopicTypeSplitVisualProps = {
  variant: HeroIllustrationVariant;
  theme: 'light' | 'dark';
  type1Label: string;
  type2Label: string;
  className?: string;
};

export const TopicTypeSplitVisual: React.FC<TopicTypeSplitVisualProps> = ({
  variant,
  theme,
  type1Label,
  type2Label,
  className = '',
}) => (
  <div className={`t1d-topic-split ${theme === 'dark' ? 't1d-topic-split--dark' : 't1d-topic-split--light'} ${className}`.trim()}>
    <div className="t1d-topic-split__pane t1d-topic-split__pane--type1">
      <HeroIllustration variant={variant} theme={theme} diabetesType="type1" />
      <span className="t1d-topic-split__label t1d-topic-split__label--type1">{type1Label}</span>
    </div>
    <div className="t1d-topic-split__pane t1d-topic-split__pane--type2">
      <HeroIllustration variant={variant} theme={theme} diabetesType="type2" />
      <span className="t1d-topic-split__label t1d-topic-split__label--type2">{type2Label}</span>
    </div>
  </div>
);
