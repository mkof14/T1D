import React from 'react';
import type { T1DTheme } from '../../lib/t1d-ui';

export type WorkspaceSectionHeaderProps = {
  title: string;
  subtitle?: string;
  theme: T1DTheme;
  isRTL?: boolean;
};

export const WorkspaceSectionHeader: React.FC<WorkspaceSectionHeaderProps> = ({
  title,
  subtitle,
  theme,
  isRTL = false,
}) => (
  <header className={`t1d-workspace-page-head ${isRTL ? 'text-right' : 'text-left'}`}>
    <h2 className={`t1d-workspace-page-head__title ${theme === 'dark' ? 'text-slate-50' : 'text-stone-900'}`}>{title}</h2>
    {subtitle ? (
      <p className={`t1d-workspace-page-head__subtitle ${theme === 'dark' ? 'text-slate-300' : 'text-stone-600'}`}>{subtitle}</p>
    ) : null}
  </header>
);
