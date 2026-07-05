import React, { Suspense, useEffect, useState } from 'react';
import type { AccessUser } from './components/AccessView';
import { SkipLink } from './components/SkipLink';
import { analyzeNutrition, connectDexcom, disconnectDexcom, finishDexcomOAuth, getSession, getWorkspace, performAction, pollDexcom, refreshDexcomAuthToken, saveSafetyPreferences, signOut, startDexcomOAuth, type ActionId, type HouseholdProfile, type SafetyPreferencesInput, type WorkspacePayload } from './lib/api';
import { applySeo } from './lib/seo';
import { memberPathForRoute, readSignupDiabetesType, setSignupDiabetesType, clearSignupDiabetesType, syncSignupTypeFromLocation } from './lib/signup-diabetes-type';
import { t1dEyebrow, t1dShell } from './lib/t1d-ui';
import { DiabetesType, Language, RTL_LANGUAGES, SUPPORTED_LANGUAGES } from './types';
import { T1DPageBackdrop } from './components/layout/T1DPageBackdrop';

const loadAccessView = () => import('./components/AccessView');
const loadHouseholdSetupView = () => import('./components/HouseholdSetupView');
const loadPublicLandingView = () => import('./components/T1DPublicLandingView');
const loadWorkspaceView = () => import('./components/WorkspaceView');

const AccessView = React.lazy(loadAccessView);
const HouseholdSetupView = React.lazy(loadHouseholdSetupView);
const T1DPublicLandingView = React.lazy(async () => {
  const module = await loadPublicLandingView();
  return { default: module.T1DPublicLandingView };
});
const WorkspaceView = React.lazy(loadWorkspaceView);

type ThemeMode = 'light' | 'dark';
type RouteMode = 'public' | 'signin' | 'signup' | 'setup' | 'workspace';
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

const STORAGE_KEYS = {
  lang: 't1d_project_lang',
  theme: 't1d_project_theme',
} as const;

const LOADING_COPY: Record<Language, string> = {
  en: 'Opening Steady',
  ru: 'Открываем Steady',
  uk: 'Відкриваємо Steady',
  es: 'Abriendo Steady',
  fr: 'Ouverture de Steady',
  de: 'Steady wird geöffnet',
  zh: '正在打开 Steady',
  ja: 'Steady を開いています',
  pt: 'Abrindo Steady',
  he: 'פותח את Steady',
  ar: 'جار فتح Steady',
};

const SKIP_LINK_COPY: Record<Language, string> = {
  en: 'Skip to main content',
  ru: 'Перейти к основному содержимому',
  uk: 'Перейти до основного вмісту',
  es: 'Saltar al contenido principal',
  fr: 'Aller au contenu principal',
  de: 'Zum Hauptinhalt springen',
  zh: '跳到主要内容',
  ja: 'メインコンテンツへスキップ',
  pt: 'Ir para o conteúdo principal',
  he: 'דלג לתוכן הראשי',
  ar: 'انتقل إلى المحتوى الرئيسي',
};

const AppShell: React.FC<{ lang: Language; children: React.ReactNode }> = ({ lang, children }) => (
  <>
    <SkipLink label={SKIP_LINK_COPY[lang]} />
    <main id="main-content" tabIndex={-1}>
      {children}
    </main>
  </>
);

const APP_ROUTE_META: Record<Exclude<RouteMode, 'public'>, Record<Language, { title: string; description: string }>> = {
  signin: {
    en: { title: 'Open T1D Access', description: 'Sign in to see today’s view, current signals, and family support status.' },
    ru: { title: 'Вход В T1D', description: 'Войдите, чтобы увидеть сегодняшнюю картину, сигналы и состояние семейной поддержки.' },
    uk: { title: 'Вхід До T1D', description: 'Увійдіть, щоб побачити сьогоднішню картину, сигнали та підтримку сім’ї.' },
    es: { title: 'Entrar En T1D', description: 'Inicia sesión para ver el estado actual, las señales y el apoyo de la familia.' },
    fr: { title: 'Entrer Dans T1D', description: 'Connectez-vous pour voir l’état actuel, les signaux et le soutien de la famille.' },
    de: { title: 'Bei T1D Anmelden', description: 'Melden Sie sich an, um den aktuellen Zustand, Signale und die Unterstützung der Familie zu sehen.' },
    zh: { title: '登录 T1D', description: '登录后可查看当前状态、提醒信号和家庭支持状态。' },
    ja: { title: 'T1D にサインイン', description: 'サインインすると、現在の状態、合図、家族の支えを確認できます。' },
    pt: { title: 'Entrar No T1D', description: 'Entre para ver o estado atual, os sinais e o apoio da família.' },
    he: { title: 'כניסה ל-T1D', description: 'התחברו כדי לראות את המצב הנוכחי, את האותות ואת מצב התמיכה של המשפחה.' },
    ar: { title: 'الدخول إلى T1D', description: 'سجّل الدخول لرؤية الحالة الحالية والإشارات ووضع دعم العائلة.' },
  },
  signup: {
    en: { title: 'Create T1D Access', description: 'Create your T1D account and start a simple daily safety setup for your family.' },
    ru: { title: 'Создать Доступ В T1D', description: 'Создайте аккаунт T1D и начните простую настройку ежедневной поддержки для семьи.' },
    uk: { title: 'Створити Доступ До T1D', description: 'Створіть акаунт T1D і почніть просте налаштування щоденної підтримки для сім’ї.' },
    es: { title: 'Crear Acceso A T1D', description: 'Crea tu cuenta T1D y comienza una configuración simple de apoyo diario para la familia.' },
    fr: { title: 'Créer Un Accès T1D', description: 'Créez votre compte T1D et commencez une configuration simple de soutien quotidien pour la famille.' },
    de: { title: 'T1D Zugang Erstellen', description: 'Erstellen Sie Ihr T1D-Konto und starten Sie eine einfache tägliche Sicherheitskonfiguration für die Familie.' },
    zh: { title: '创建 T1D 账号', description: '创建 T1D 账号，开始为家庭设置简洁的日常支持流程。' },
    ja: { title: 'T1D アカウントを作成', description: 'T1D アカウントを作成して、家族のためのシンプルな日常サポート設定を始めます。' },
    pt: { title: 'Criar Acesso Ao T1D', description: 'Crie sua conta T1D e inicie uma configuração simples de apoio diário para a família.' },
    he: { title: 'יצירת גישה ל-T1D', description: 'צרו חשבון T1D והתחילו הגדרה פשוטה של תמיכה יומיומית למשפחה.' },
    ar: { title: 'إنشاء وصول إلى T1D', description: 'أنشئ حساب T1D وابدأ إعدادًا بسيطًا لدعم العائلة خلال اليوم.' },
  },
  setup: {
    en: { title: 'Set Up Your Family', description: 'Add family members, backup support, and safety preferences for day and night.' },
    ru: { title: 'Настройка Семьи', description: 'Добавьте членов семьи, резервную поддержку и настройки безопасности для дня и ночи.' },
    uk: { title: 'Налаштування Сім’ї', description: 'Додайте членів сім’ї, резервну підтримку та налаштування безпеки для дня і ночі.' },
    es: { title: 'Configurar La Familia', description: 'Agrega a la familia, el apoyo de reserva y las preferencias de seguridad para el día y la noche.' },
    fr: { title: 'Configurer La Famille', description: 'Ajoutez la famille, le soutien de secours et les préférences de sécurité pour le jour et la nuit.' },
    de: { title: 'Familie Einrichten', description: 'Fügen Sie Familienmitglieder, Reserve-Unterstützung und Sicherheitseinstellungen für Tag und Nacht hinzu.' },
    zh: { title: '设置家庭支持', description: '添加家庭成员、后备支持，以及白天和夜间的安全偏好。' },
    ja: { title: '家族の設定', description: '家族メンバー、予備の支え、昼と夜の安全設定を追加します。' },
    pt: { title: 'Configurar A Família', description: 'Adicione a família, o apoio reserva e as preferências de segurança para o dia e a noite.' },
    he: { title: 'הגדרת המשפחה', description: 'הוסיפו בני משפחה, גיבוי תומך והעדפות בטיחות ליום וללילה.' },
    ar: { title: 'إعداد العائلة', description: 'أضف أفراد العائلة والدعم الاحتياطي وتفضيلات الأمان للنهار والليل.' },
  },
  workspace: {
    en: { title: 'T1D Daily View', description: 'See the current state, recent signals, device health, family readiness, and support flow in one place.' },
    ru: { title: 'T1D: Картина Дня', description: 'Смотрите текущее состояние, недавние сигналы, состояние устройства и готовность семьи в одном месте.' },
    uk: { title: 'T1D: Картина Дня', description: 'Дивіться поточний стан, недавні сигнали, стан пристрою та готовність сім’ї в одному місці.' },
    es: { title: 'Vista Diaria De T1D', description: 'Mira el estado actual, las señales recientes, la salud del dispositivo y la preparación familiar en un solo lugar.' },
    fr: { title: 'Vue Quotidienne T1D', description: 'Voyez l’état actuel, les signaux récents, la santé de l’appareil et la préparation de la famille au même endroit.' },
    de: { title: 'T1D Tagesansicht', description: 'Sehen Sie aktuellen Zustand, letzte Signale, Gerätestatus und Familienbereitschaft an einem Ort.' },
    zh: { title: 'T1D 日常安全视图', description: '在一个页面里查看当前状态、最新信号、设备状态和家庭准备情况。' },
    ja: { title: 'T1D デイリー表示', description: '現在の状態、最近の合図、デバイスの状態、家族の準備状況をひとつで確認できます。' },
    pt: { title: 'Visão Diária T1D', description: 'Veja o estado atual, os sinais recentes, a saúde do dispositivo e a prontidão da família em um só lugar.' },
    he: { title: 'תצוגת הבטיחות היומית של T1D', description: 'ראו במקום אחד את המצב הנוכחי, האותות האחרונים, מצב המכשיר ומוכנות המשפחה.' },
    ar: { title: 'عرض الأمان اليومي من T1D', description: 'شاهد الحالة الحالية والإشارات الأخيرة وصحة الجهاز وجاهزية العائلة في مكان واحد.' },
  },
};

const resolveRoute = (pathname: string, hasSession: boolean): RouteMode => {
  if (pathname === '/access') return 'signin';
  if (pathname === '/create-account') return 'signup';
  if (pathname === '/household-setup') return hasSession ? 'setup' : 'signin';
  if (pathname === '/workspace') return hasSession ? 'workspace' : 'signin';
  return 'public';
};

const RouteLoading: React.FC<{ lang: Language; theme: ThemeMode }> = ({ lang, theme }) => (
  <div className={`${t1dShell(theme)} relative flex min-h-screen items-center justify-center`}>
    <T1DPageBackdrop theme={theme} />
    <p className={`relative z-10 ${t1dEyebrow(theme)}`}>{LOADING_COPY[lang]}</p>
  </div>
);

const App: React.FC = () => {
  const dexcomAutoPollInFlight = React.useRef(false);
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
    const path =
      route === 'signin' ? '/access' :
      route === 'signup' ? '/create-account' :
      route === 'setup' ? '/household-setup' :
      '/workspace';

    applySeo({
      title: `${meta.title} | T1D`,
      description: meta.description,
      path,
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
    const type = readSignupDiabetesType() ?? workspace?.household?.diabetesType ?? null;
    const nextPath = route === 'public' ? '/' : memberPathForRoute(route, type);

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
        <Suspense fallback={<RouteLoading lang={lang} theme={theme} />}>
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
            onModeChange={(nextMode) => setRoute(nextMode)}
          />
        </Suspense>
      </AppShell>
    );
  }

  if (route === 'setup' && session) {
    return (
      <AppShell lang={lang}>
        <Suspense fallback={<RouteLoading lang={lang} theme={theme} />}>
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
        </Suspense>
      </AppShell>
    );
  }

  const handleWorkspaceRefresh = async () => {
    const nextWorkspace = await getWorkspace();
    setWorkspace(nextWorkspace);
  };

  if (route === 'workspace' && session) {
    return (
      <AppShell lang={lang}>
        <Suspense fallback={<RouteLoading lang={lang} theme={theme} />}>
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
            onAction={handleDoneAction} onPreferencesSave={handlePreferencesSave} onDexcomConnect={handleDexcomConnect} onDexcomOAuthStart={handleDexcomOAuthStart} onDexcomOAuthFinish={handleDexcomOAuthFinish} onDexcomTokenRefresh={handleDexcomTokenRefresh} onDexcomDisconnect={handleDexcomDisconnect} onDexcomPoll={handleDexcomPoll} onNutritionAnalyze={handleNutritionAnalyze} onWorkspaceRefresh={handleWorkspaceRefresh} />
        </Suspense>
      </AppShell>
    );
  }

  return (
    <AppShell lang={lang}>
      <Suspense fallback={<RouteLoading lang={lang} theme={theme} />}>
        <T1DPublicLandingView
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          basePath=""
          onSignIn={() => setRoute('signin')}
          onSignUp={beginSignup}
        />
      </Suspense>
    </AppShell>
  );
};

export default App;
