import type { DiabetesType } from '../types';
import type { T1DTheme } from './t1d-ui';

export { memberLayoutTypeClass } from './hero-path';

export const memberShellTypeClass = (diabetesType?: DiabetesType | null) =>
  diabetesType === 'type2' ? 't1d-member-shell--type2' : diabetesType === 'type1' ? 't1d-member-shell--type1' : '';

export const typeAccentBarClass = (diabetesType?: DiabetesType | null, theme?: T1DTheme) => {
  const tone = theme === 'dark' ? 't1d-accent-bar--dark' : '';
  if (diabetesType === 'type2') return `t1d-accent-bar t1d-accent-bar--type2 ${tone}`.trim();
  if (diabetesType === 'type1') return `t1d-accent-bar t1d-accent-bar--type1 ${tone}`.trim();
  return `t1d-accent-bar ${tone}`.trim();
};

export const workspaceShellTypeClass = (diabetesType?: DiabetesType | null) =>
  diabetesType === 'type2' ? 't1d-workspace-shell--type2' : diabetesType === 'type1' ? 't1d-workspace-shell--type1' : '';

export const workspaceNavTypeClass = (diabetesType?: DiabetesType | null) =>
  diabetesType === 'type2' ? 't1d-workspace-nav--type2' : diabetesType === 'type1' ? 't1d-workspace-nav--type1' : '';

export const glucoseDashboardTypeClass = (diabetesType?: DiabetesType | null) =>
  diabetesType === 'type2' ? 't1d-glucose-dashboard--type2' : diabetesType === 'type1' ? 't1d-glucose-dashboard--type1' : '';

export const typeCardClass = (diabetesType: DiabetesType, theme: T1DTheme) =>
  `t1d-type-card t1d-type-card--${diabetesType} ${theme === 'dark' ? 't1d-type-card--dark' : 't1d-type-card--light'}`;
