import React from 'react';
import { readSignupDiabetesType } from '../../lib/signup-diabetes-type';
import type { RouteMode } from '../../lib/app-routing';
import type { useT1DAppController } from '../../hooks/useT1DAppController';
import {
  AccessView,
  AdminView,
  AppShell,
  HouseholdSetupView,
  LazyRoute,
  RouteLoading,
  T1DPublicLandingView,
  WorkspaceView,
} from './AppChrome';

type AppController = ReturnType<typeof useT1DAppController>;

export const T1DAppRouter: React.FC<{ controller: AppController }> = ({ controller }) => {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    session,
    route,
    setRoute,
    workspace,
    authReady,
    handleAuthSuccess,
    handleSetupComplete,
    beginSignup,
    handleLogout,
    handleDoneAction,
    handleNutritionAnalyze,
    handlePreferencesSave,
    handleDexcomConnect,
    handleDexcomOAuthStart,
    handleDexcomOAuthFinish,
    handleDexcomTokenRefresh,
    handleDexcomDisconnect,
    handleDexcomPoll,
    handleWorkspaceRefresh,
  } = controller;

  if (!authReady) {
    return (
      <AppShell lang={lang}>
        <RouteLoading lang={lang} theme={theme} />
      </AppShell>
    );
  }

  if (route === 'signin' || route === 'signup') {
    return (
      <AppShell lang={lang}>
        <LazyRoute lang={lang} theme={theme}>
          <AccessView
            mode={route}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            diabetesType={readSignupDiabetesType()}
            onBack={() => setRoute('public')}
            onSignUp={beginSignup}
            onSuccess={handleAuthSuccess}
            onModeChange={(nextMode: RouteMode) => setRoute(nextMode)}
          />
        </LazyRoute>
      </AppShell>
    );
  }

  if (route === 'setup' && session) {
    return (
      <AppShell lang={lang}>
        <LazyRoute lang={lang} theme={theme}>
          <HouseholdSetupView
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            role={session.role}
            fullName={session.fullName || session.email}
            onComplete={handleSetupComplete}
            onBack={() => setRoute('public')}
            onSignUp={beginSignup}
          />
        </LazyRoute>
      </AppShell>
    );
  }

  if (route === 'workspace' && session) {
    return (
      <AppShell lang={lang}>
        <LazyRoute lang={lang} theme={theme}>
          <WorkspaceView
            user={session}
            lang={lang}
            setLang={setLang}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
            workspace={workspace}
            onBackToPublic={() => setRoute('public')}
            onSignUp={beginSignup}
            onAction={handleDoneAction}
            onPreferencesSave={handlePreferencesSave}
            onDexcomConnect={handleDexcomConnect}
            onDexcomOAuthStart={handleDexcomOAuthStart}
            onDexcomOAuthFinish={handleDexcomOAuthFinish}
            onDexcomTokenRefresh={handleDexcomTokenRefresh}
            onDexcomDisconnect={handleDexcomDisconnect}
            onDexcomPoll={handleDexcomPoll}
            onNutritionAnalyze={handleNutritionAnalyze}
            onWorkspaceRefresh={handleWorkspaceRefresh}
          />
        </LazyRoute>
      </AppShell>
    );
  }

  if (route === 'admin') {
    return (
      <AppShell lang={lang}>
        <LazyRoute lang={lang} theme={theme}>
          <AdminView theme={theme} setTheme={setTheme} onBackToPublic={() => setRoute('public')} />
        </LazyRoute>
      </AppShell>
    );
  }

  return (
    <AppShell lang={lang}>
      <LazyRoute lang={lang} theme={theme}>
        <T1DPublicLandingView
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          basePath=""
          onSignIn={() => setRoute('signin')}
          onSignUp={beginSignup}
        />
      </LazyRoute>
    </AppShell>
  );
};
