import type { Language } from '../types';

export type RouteMode = 'public' | 'signin' | 'signup' | 'setup' | 'workspace' | 'admin';
export type ThemeMode = 'light' | 'dark';

export const STORAGE_KEYS = {
  lang: 't1d_project_lang',
  theme: 't1d_project_theme',
} as const;

export const LOADING_COPY: Record<Language, string> = {
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

export const SKIP_LINK_COPY: Record<Language, string> = {
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

export const APP_ROUTE_META: Record<Exclude<RouteMode, 'public'>, Record<Language, { title: string; description: string }>> = {
  signin: {
    en: { title: 'Sign in to Steady', description: 'Sign in to see today’s view, current signals, and family support status.' },
    ru: { title: 'Вход в Steady', description: 'Войдите, чтобы увидеть сегодняшнюю картину, сигналы и состояние семейной поддержки.' },
    uk: { title: 'Вхід до Steady', description: 'Увійдіть, щоб побачити сьогоднішню картину, сигнали та підтримку сім’ї.' },
    es: { title: 'Entrar en Steady', description: 'Inicia sesión para ver el estado actual, las señales y el apoyo de la familia.' },
    fr: { title: 'Se connecter à Steady', description: 'Connectez-vous pour voir l’état actuel, les signaux et le soutien de la famille.' },
    de: { title: 'Bei Steady anmelden', description: 'Melden Sie sich an, um den aktuellen Zustand, Signale und die Unterstützung der Familie zu sehen.' },
    zh: { title: '登录 Steady', description: '登录后可查看当前状态、提醒信号和家庭支持状态。' },
    ja: { title: 'Steady にサインイン', description: 'サインインすると、現在の状態、合図、家族の支えを確認できます。' },
    pt: { title: 'Entrar no Steady', description: 'Entre para ver o estado atual, os sinais e o apoio da família.' },
    he: { title: 'כניסה ל-Steady', description: 'התחברו כדי לראות את המצב הנוכחי, את האותות ואת מצב התמיכה של המשפחה.' },
    ar: { title: 'تسجيل الدخول إلى Steady', description: 'سجّل الدخول لرؤية الحالة الحالية والإشارات ووضع دعم العائلة.' },
  },
  signup: {
    en: { title: 'Create your Steady account', description: 'Create your account and start a simple daily safety setup for your family.' },
    ru: { title: 'Создать аккаунт Steady', description: 'Создайте аккаунт и начните простую настройку ежедневной поддержки для семьи.' },
    uk: { title: 'Створити акаунт Steady', description: 'Створіть акаунт і почніть просте налаштування щоденної підтримки для сім’ї.' },
    es: { title: 'Crear cuenta en Steady', description: 'Crea tu cuenta y comienza una configuración simple de apoyo diario para la familia.' },
    fr: { title: 'Créer un compte Steady', description: 'Créez votre compte et commencez une configuration simple de soutien quotidien pour la famille.' },
    de: { title: 'Steady-Konto erstellen', description: 'Erstellen Sie Ihr Konto und starten Sie eine einfache tägliche Sicherheitskonfiguration für die Familie.' },
    zh: { title: '创建 Steady 账号', description: '创建账号，开始为家庭设置简洁的日常支持流程。' },
    ja: { title: 'Steady アカウントを作成', description: 'アカウントを作成して、家族のためのシンプルな日常サポート設定を始めます。' },
    pt: { title: 'Criar conta no Steady', description: 'Crie sua conta e inicie uma configuração simples de apoio diário para a família.' },
    he: { title: 'יצירת חשבון Steady', description: 'צרו חשבון והתחילו הגדרה פשוטה של תמיכה יומיומית למשפחה.' },
    ar: { title: 'إنشاء حساب Steady', description: 'أنشئ حسابًا وابدأ إعدادًا بسيطًا لدعم العائلة خلال اليوم.' },
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
    en: { title: 'Steady Daily View', description: 'See the current state, recent signals, device health, family readiness, and support flow in one place.' },
    ru: { title: 'Steady: картина дня', description: 'Смотрите текущее состояние, недавние сигналы, состояние устройства и готовность семьи в одном месте.' },
    uk: { title: 'Steady: картина дня', description: 'Дивіться поточний стан, недавні сигнали, стан пристрою та готовність сім’ї в одному місці.' },
    es: { title: 'Vista diaria de Steady', description: 'Mira el estado actual, las señales recientes, la salud del dispositivo y la preparación familiar en un solo lugar.' },
    fr: { title: 'Vue quotidienne Steady', description: 'Voyez l’état actuel, les signaux récents, la santé de l’appareil et la préparation de la famille au même endroit.' },
    de: { title: 'Steady Tagesansicht', description: 'Sehen Sie aktuellen Zustand, letzte Signale, Gerätestatus und Familienbereitschaft an einem Ort.' },
    zh: { title: 'Steady 日常视图', description: '在一个页面里查看当前状态、最新信号、设备状态和家庭准备情况。' },
    ja: { title: 'Steady デイリー表示', description: '現在の状態、最近の合図、デバイスの状態、家族の準備状況をひとつで確認できます。' },
    pt: { title: 'Visão diária Steady', description: 'Veja o estado atual, os sinais recentes, a saúde do dispositivo e a prontidão da família em um só lugar.' },
    he: { title: 'תצוגה יומית של Steady', description: 'ראו במקום אחד את המצב הנוכחי, האותות האחרונים, מצב המכשיר ומוכנות המשפחה.' },
    ar: { title: 'عرض Steady اليومي', description: 'شاهد الحالة الحالية والإشارات الأخيرة وصحة الجهاز وجاهزية العائلة في مكان واحد.' },
  },
  admin: {
    en: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    ru: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    uk: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    es: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    fr: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    de: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    zh: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    ja: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    pt: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    he: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
    ar: { title: 'T1D Admin', description: 'Read-only operations dashboard for households, alerts, and SQL parity.' },
  },
};

export const resolveRoute = (pathname: string, hasSession: boolean): RouteMode => {
  if (pathname === '/admin') return 'admin';
  if (pathname === '/access') return 'signin';
  if (pathname === '/create-account') return 'signup';
  if (pathname === '/household-setup') return hasSession ? 'setup' : 'signin';
  if (pathname === '/workspace') return hasSession ? 'workspace' : 'signin';
  return 'public';
};

export const routePathForMode = (route: RouteMode): string => {
  if (route === 'signin') return '/access';
  if (route === 'signup') return '/create-account';
  if (route === 'setup') return '/household-setup';
  if (route === 'admin') return '/admin';
  if (route === 'workspace') return '/workspace';
  return '/';
};
