import React, { Suspense } from 'react';
import type { Language } from '../../types';
import { SkipLink } from '../SkipLink';
import { T1DPageBackdrop } from '../layout/T1DPageBackdrop';
import { LOADING_COPY, SKIP_LINK_COPY, type ThemeMode } from '../../lib/app-routing';
import { t1dEyebrow, t1dShell } from '../../lib/t1d-ui';

export const loadAccessView = () => import('../AccessView');
export const loadHouseholdSetupView = () => import('../HouseholdSetupView');
export const loadPublicLandingView = () => import('../T1DPublicLandingView');
export const loadWorkspaceView = () => import('../WorkspaceView');
export const loadAdminView = () => import('../AdminView');

export const AccessView = React.lazy(loadAccessView);
export const HouseholdSetupView = React.lazy(loadHouseholdSetupView);
export const T1DPublicLandingView = React.lazy(async () => {
  const module = await loadPublicLandingView();
  return { default: module.T1DPublicLandingView };
});
export const WorkspaceView = React.lazy(loadWorkspaceView);
export const AdminView = React.lazy(async () => {
  const module = await loadAdminView();
  return { default: module.AdminView };
});

export const AppShell: React.FC<{ lang: Language; children: React.ReactNode }> = ({ lang, children }) => (
  <>
    <SkipLink label={SKIP_LINK_COPY[lang]} />
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  </>
);

export const RouteLoading: React.FC<{ lang: Language; theme: ThemeMode }> = ({ lang, theme }) => (
  <div className={`${t1dShell(theme)} relative flex min-h-screen items-center justify-center`}>
    <T1DPageBackdrop theme={theme} />
    <p className={`relative z-10 ${t1dEyebrow(theme)}`}>{LOADING_COPY[lang]}</p>
  </div>
);

export const LazyRoute: React.FC<{ lang: Language; theme: ThemeMode; children: React.ReactNode }> = ({ lang, theme, children }) => (
  <Suspense fallback={<RouteLoading lang={lang} theme={theme} />}>{children}</Suspense>
);
