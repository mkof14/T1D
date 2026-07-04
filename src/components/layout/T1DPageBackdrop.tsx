import React from 'react';
import type { T1DTheme } from '../../lib/t1d-ui';
import type { DiabetesType } from '../../types';
import { memberShellTypeClass } from '../../lib/diabetes-type-theme';

interface T1DPageBackdropProps {
  theme: T1DTheme;
  diabetesType?: DiabetesType | null;
}

export const T1DPageBackdrop: React.FC<T1DPageBackdropProps> = ({ theme, diabetesType = null }) => (
  <div className={`t1d-backdrop pointer-events-none ${memberShellTypeClass(diabetesType)}`} aria-hidden="true">
    <div className={`t1d-orb t1d-orb-a ${theme === 'dark' ? 't1d-orb-a--dark' : ''}`} />
    <div className={`t1d-orb t1d-orb-b ${theme === 'dark' ? 't1d-orb-b--dark' : ''}`} />
    <div className={`t1d-orb t1d-orb-c ${theme === 'dark' ? 't1d-orb-c--dark' : ''}`} />
    <div className={`t1d-orb t1d-orb-d ${theme === 'dark' ? 't1d-orb-d--dark' : ''}`} />
    <div className={`t1d-grid-overlay ${theme === 'dark' ? 't1d-grid-overlay--dark' : ''}`} />
  </div>
);
