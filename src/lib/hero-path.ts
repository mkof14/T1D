import type { HeroIllustrationVariant } from '../components/layout/hero-art/HeroIllustrations';
import type { DiabetesType } from '../types';

/** T2 uses only adult-safe art — no child hands, no family-with-children scenes. */
const TYPE2_HERO_VARIANT: Partial<Record<HeroIllustrationVariant, HeroIllustrationVariant>> = {
  home: 'workspace',
  system: 'workspace',
  night: 'compliance',
  family: 'setup',
  trust: 'compliance',
  medical: 'compliance',
  'access-signin': 'access-signin',
  'access-signup': 'access-signup',
  setup: 'setup',
  workspace: 'workspace',
};

/** T1 keeps family / night imagery where it fits the child-support story. */
const TYPE1_HERO_VARIANT: Partial<Record<HeroIllustrationVariant, HeroIllustrationVariant>> = {
  home: 'home',
  family: 'family',
  night: 'night',
  setup: 'setup',
  'access-signup': 'access-signup',
  workspace: 'workspace',
};

export const resolveHeroVariant = (
  variant: HeroIllustrationVariant,
  diabetesType?: DiabetesType | null,
): HeroIllustrationVariant => {
  if (diabetesType === 'type2') {
    return TYPE2_HERO_VARIANT[variant] ?? variant;
  }
  if (diabetesType === 'type1') {
    return TYPE1_HERO_VARIANT[variant] ?? variant;
  }
  return variant;
};

export const memberLayoutTypeClass = (diabetesType?: DiabetesType | null) =>
  diabetesType === 'type2' ? 't1d-member-layout--type2' : diabetesType === 'type1' ? 't1d-member-layout--type1' : '';
