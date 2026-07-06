import type { HeroIllustrationVariant } from '../components/layout/hero-art/HeroIllustrations';
import type { WorkspaceSectionId } from '../content/workspace-nav-copy';

export const MEMBER_ACCESS_HERO = {
  signin: 'access-signin',
  signup: 'access-signup',
} as const satisfies Record<'signin' | 'signup', HeroIllustrationVariant>;

export const WORKSPACE_SECTION_HERO: Record<WorkspaceSectionId, HeroIllustrationVariant> = {
  now: 'workspace',
  nutrition: 'how',
  timeline: 'how',
  system: 'system',
  alerts: 'night',
  settings: 'setup',
  family: 'family',
  history: 'learn',
};

export const resolveWorkspaceSectionHero = (section: WorkspaceSectionId): HeroIllustrationVariant =>
  WORKSPACE_SECTION_HERO[section];
