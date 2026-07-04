import type { DiabetesType, Language, UserRole } from '../types';
import { WORKSPACE_COPY } from '../content/workspace-copy';
import { WORKSPACE_TYPE_COPY } from '../content/workspace-type-copy';
import { WORKSPACE_T2_LABELS } from '../content/workspace-t2-labels';
import { WORKSPACE_NAV, type WorkspaceSectionId } from '../content/workspace-nav-copy';
import { WORKSPACE_INVITE_COPY, WORKSPACE_SECTION_HEADERS } from '../content/workspace-ux-copy';

type RoleFocus = { title: string; body: string; points: [string, string, string] };

export const resolveRoleFocus = (lang: Language, diabetesType: DiabetesType | undefined, role: UserRole): RoleFocus => {
  const base = WORKSPACE_COPY[lang].roleFocus[role];
  if (diabetesType === 'type2' && (role === 'adult' || role === 'parent')) {
    return WORKSPACE_TYPE_COPY[lang].roleFocus[role];
  }
  return base;
};

export const resolvePreferenceExplainer = (lang: Language, diabetesType: DiabetesType | undefined, fallback: string) =>
  diabetesType === 'type2' ? WORKSPACE_TYPE_COPY[lang].preferenceExplainer : fallback;

export const resolveFailStateHints = (
  lang: Language,
  diabetesType: DiabetesType | undefined,
  fallback: { dayHint: string; nightHint: string },
) => (diabetesType === 'type2' ? WORKSPACE_TYPE_COPY[lang].failStates : fallback);

export const resolveWorkspaceCopy = (lang: Language, diabetesType: DiabetesType | undefined) => {
  const base = WORKSPACE_COPY[lang];
  if (diabetesType !== 'type2') return base;
  const t2 = WORKSPACE_T2_LABELS[lang];
  return {
    ...base,
    eyebrow: t2.eyebrow,
    household: t2.household,
    childCard: t2.childCard,
    householdName: t2.householdName,
    ageBand: t2.ageBand,
    primaryParent: t2.primaryParent,
    caregiver: t2.caregiver,
  };
};

export const resolveWorkspaceNav = (lang: Language, diabetesType: DiabetesType | undefined) => {
  const nav = WORKSPACE_NAV[lang];
  if (diabetesType !== 'type2') return nav;
  return { ...nav, family: WORKSPACE_T2_LABELS[lang].navFamily };
};

export const resolveWorkspaceSectionHeaders = (lang: Language, diabetesType: DiabetesType | undefined) => {
  const headers = WORKSPACE_SECTION_HEADERS[lang];
  if (diabetesType !== 'type2') return headers;
  return { ...headers, family: WORKSPACE_T2_LABELS[lang].sectionFamily };
};

export const resolveWorkspaceInviteCopy = (lang: Language, diabetesType: DiabetesType | undefined) => {
  const base = WORKSPACE_INVITE_COPY[lang];
  if (diabetesType !== 'type2') return base;
  const t2 = WORKSPACE_T2_LABELS[lang].invite;
  return { ...base, title: t2.title, body: t2.body };
};

export type ResolvedWorkspaceSectionId = WorkspaceSectionId;
