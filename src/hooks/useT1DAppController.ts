import React, { useEffect, useRef, useState } from 'react';
import type { AccessUser } from '../components/AccessView';
import {
  analyzeNutrition,
  connectDexcom,
  disconnectDexcom,
  finishDexcomOAuth,
  getSession,
  getWorkspace,
  performAction,
  pollDexcom,
  refreshDexcomAuthToken,
  saveSafetyPreferences,
  signOut,
  startDexcomOAuth,
  type ActionId,
  type HouseholdProfile,
  type SafetyPreferencesInput,
  type WorkspacePayload,
} from '../lib/api';
import {
  APP_ROUTE_META,
  resolveRoute,
  routePathForMode,
  STORAGE_KEYS,
  type RouteMode,
  type ThemeMode,
} from '../lib/app-routing';
import { applySeo } from '../lib/seo';
import {
  clearSignupDiabetesType,
  memberPathForRoute,
  readSignupDiabetesType,
  setSignupDiabetesType,
  syncSignupTypeFromLocation,
} from '../lib/signup-diabetes-type';
import { DiabetesType, Language, RTL_LANGUAGES, SUPPORTED_LANGUAGES } from '../types';
import {
  loadAccessView,
  loadHouseholdSetupView,
  loadPublicLandingView,
  loadWorkspaceView,
} from '../components/app/AppChrome';

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export const useT1DAppController = () => {
  const dexcomAutoPollInFlight = useRef(false);
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(STORAGE_KEYS.lang) as Language | null;
    return stored && SUPPORTED_LANGUAGES.includes(stored) ? stored : 'en';
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem(STORAGE_KEYS.theme);
    return stored === 'dark' ? 'dark' : 'light';
  });
  const [session, setSession] = useState<AccessUser | null>(null);
  const [route, setRoute] = useState<RouteMode>(() => {
    if (typeof window === 'undefined') return 'public';
    return resolveRoute(window.location.pathname, false);
  });
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.lang, lang);
  }, [lang]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    if (route === 'public') return;
    const meta = APP_ROUTE_META[route][lang];
    applySeo({
      title: `${meta.title} | T1D`,
      description: meta.description,
      path: routePathForMode(route),
      robots: 'noindex,nofollow',
    });
  }, [lang, route]);

  useEffect(() => {
    const handlePopState = () => setRoute(resolveRoute(window.location.pathname, Boolean(session)));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [session]);

  useEffect(() => {
    if (!authReady || route !== 'workspace' || !session) return;
    const params = new URLSearchParams(window.location.search);
    const dexcomAuth = params.get('dexcom_auth');
    if (!dexcomAuth) return;

    getWorkspace()
      .then((nextWorkspace) => setWorkspace(nextWorkspace))
      .finally(() => {
        params.delete('dexcom_auth');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
      });
  }, [authReady, route, session]);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((response) => {
        if (!mounted) return;
        if (response.authenticated && response.user) {
          setSession({ ...response.user, password: '' });
          setRoute(resolveRoute(window.location.pathname, true));
          return;
        }
        setSession(null);
        setRoute(resolveRoute(window.location.pathname, false));
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setRoute(resolveRoute(window.location.pathname, false));
      })
      .finally(() => {
        if (mounted) setAuthReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    syncSignupTypeFromLocation();
  }, []);

  useEffect(() => {
    if (route === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin');
      }
      return;
    }
    if (route === 'public') {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      return;
    }
    const type = readSignupDiabetesType() ?? workspace?.household?.diabetesType ?? null;
    const nextPath = memberPathForRoute(route, type);
    if (`${window.location.pathname}${window.location.search}` !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  }, [route, workspace?.household?.diabetesType]);

  useEffect(() => {
    if (workspace?.household?.diabetesType) {
      setSignupDiabetesType(workspace.household.diabetesType);
    }
  }, [workspace?.household?.diabetesType]);

  useEffect(() => {
    if (route !== 'workspace' || !session) return;

    let mounted = true;
    getWorkspace()
      .then((response) => {
        if (mounted) setWorkspace(response);
        if (mounted && response.needsSetup) setRoute('setup');
      })
      .catch(() => {
        if (mounted) setWorkspace(null);
      });

    return () => {
      mounted = false;
    };
  }, [route, session]);

  useEffect(() => {
    if (route !== 'workspace' || !session || !workspace?.dexcomConnection) return;
    const dexcom = workspace.dexcomConnection;
    if (dexcom.status !== 'connected' && !dexcom.nextPollDueAt) return;

    const fallbackMs = Math.max(15, dexcom.pollIntervalSeconds || 60) * 1000;
    const dueAtMs = dexcom.nextPollDueAt ? Date.parse(dexcom.nextPollDueAt) : NaN;
    const delayMs = Number.isFinite(dueAtMs) ? Math.max(1000, dueAtMs - Date.now()) : fallbackMs;
    const timer = window.setTimeout(() => {
      if (dexcomAutoPollInFlight.current) return;
      dexcomAutoPollInFlight.current = true;
      pollDexcom()
        .then((nextWorkspace) => setWorkspace(nextWorkspace))
        .catch(() => {})
        .finally(() => {
          dexcomAutoPollInFlight.current = false;
        });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [route, session, workspace?.dexcomConnection?.status, workspace?.dexcomConnection?.pollIntervalSeconds, workspace?.dexcomConnection?.nextPollDueAt, workspace?.dexcomConnection?.requestHealth]);

  useEffect(() => {
    if (!authReady || typeof window === 'undefined') return;

    const idleWindow = window as IdleWindow;
    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const preloadRouteNeighbors = () => {
      if (route === 'public') {
        void loadAccessView();
        return;
      }
      if (route === 'signin' || route === 'signup') {
        void loadHouseholdSetupView();
        void loadWorkspaceView();
        return;
      }
      if (route === 'setup') {
        void loadWorkspaceView();
        return;
      }
      if (route === 'workspace') {
        void loadPublicLandingView();
      }
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleId = idleWindow.requestIdleCallback(preloadRouteNeighbors, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(preloadRouteNeighbors, 400);
    }

    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (idleId !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleId);
      }
    };
  }, [authReady, route]);

  const handleAuthSuccess = async (user: AccessUser, options?: { householdReady?: boolean }) => {
    setSession(user);
    if (options?.householdReady) {
      const nextWorkspace = await getWorkspace();
      if (nextWorkspace.household?.diabetesType) {
        setSignupDiabetesType(nextWorkspace.household.diabetesType);
      }
      setWorkspace(nextWorkspace);
      setRoute('workspace');
      return;
    }
    setRoute('setup');
  };

  const handleSetupComplete = async (household: HouseholdProfile) => {
    setSignupDiabetesType(household.diabetesType);
    const nextWorkspace = await getWorkspace();
    setWorkspace(nextWorkspace);
    setRoute('workspace');
  };

  const beginSignup = (type: DiabetesType) => {
    setSignupDiabetesType(type);
    setRoute('signup');
  };

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setWorkspace(null);
    clearSignupDiabetesType();
    setRoute('public');
  };

  const handleDoneAction = async (action: ActionId) => {
    const nextWorkspace = await performAction(action);
    setWorkspace(nextWorkspace);
  };

  const handleNutritionAnalyze = async (payload: { imageBase64?: string; note?: string }) => {
    const nextWorkspace = await analyzeNutrition(payload);
    setWorkspace(nextWorkspace);
  };

  const handlePreferencesSave = async (preferences: SafetyPreferencesInput) => {
    const nextWorkspace = await saveSafetyPreferences(preferences);
    setWorkspace(nextWorkspace);
  };

  const handleDexcomConnect = async () => {
    const nextWorkspace = await connectDexcom({ accountName: session?.fullName || session?.email || '' });
    setWorkspace(nextWorkspace);
  };

  const handleDexcomOAuthStart = async () => {
    const response = await startDexcomOAuth();
    setWorkspace(response.workspace);
    if (response.redirectUrl && typeof window !== 'undefined') {
      window.open(response.redirectUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDexcomOAuthFinish = async (code: string) => {
    const nextWorkspace = await finishDexcomOAuth(code);
    setWorkspace(nextWorkspace);
  };

  const handleDexcomTokenRefresh = async () => {
    const nextWorkspace = await refreshDexcomAuthToken();
    setWorkspace(nextWorkspace);
  };

  const handleDexcomDisconnect = async () => {
    const nextWorkspace = await disconnectDexcom();
    setWorkspace(nextWorkspace);
  };

  const handleDexcomPoll = async () => {
    const nextWorkspace = await pollDexcom();
    setWorkspace(nextWorkspace);
  };

  const handleWorkspaceRefresh = async () => {
    const nextWorkspace = await getWorkspace();
    setWorkspace(nextWorkspace);
  };

  return {
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
  };
};
