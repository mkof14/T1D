import type { Language, UserRole } from '../types';

export interface AccessCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary: string;
  back: string;
  switchLabel: string;
  switchAction: string;
  working: string;
  fields: {
    fullName: string;
    role: string;
    organization: string;
    email: string;
    password: string;
  };
  placeholders: {
    fullName: string;
    organization: string;
    email: string;
    password: string;
  };
  roles: Partial<Record<UserRole, string>>;
  errors: {
    missingName: string;
    missingCredentials: string;
    incorrectCredentials: string;
    duplicateEmail: string;
    requestFailed: string;
  };
}

export type AccessMode = 'signin' | 'signup';

export const COPY: Record<Language, Record<AccessMode, AccessCopy>> = {
  en: {
    signin: {
      eyebrow: 'Welcome back',
      title: 'Good to see you again',
      subtitle: 'Open your family daily view.',
      primary: 'Sign in',
      back: 'Back To Public Site',
      switchLabel: 'Need a new account?',
      switchAction: 'Create account',
      working: 'Working...',
      fields: {
        fullName: 'Full Name',
        role: 'Role',
        organization: 'Clinic / Organization',
        email: 'Email',
        password: 'Password',
      },
      placeholders: {
        fullName: 'Taylor Morgan',
        organization: 'Optional',
        email: 'you@example.com',
        password: 'Enter your password',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adult Living With Diabetes',
        caregiver: 'Support Adult',
      },
      errors: {
        missingName: 'Add your name.',
        missingCredentials: 'Email and password are required.',
        incorrectCredentials: 'Email or password is incorrect.',
        duplicateEmail: 'This email already has a Steady account.',
        requestFailed: 'Request failed. Please try again.',
      },
    },
    signup: {
      eyebrow: 'Join Steady',
      title: 'Create your family space',
      subtitle: 'For type 1 or type 2 — parents, adults, and support adults.',
      primary: 'Create Account',
      back: 'Back To Public Site',
      switchLabel: 'Already created one?',
      switchAction: 'Sign in',
      working: 'Working...',
      fields: {
        fullName: 'Full Name',
        role: 'Role',
        organization: 'Clinic / Organization',
        email: 'Email',
        password: 'Password',
      },
      placeholders: {
        fullName: 'Taylor Morgan',
        organization: 'Optional',
        email: 'you@example.com',
        password: 'Choose a password',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adult Living With Diabetes',
        caregiver: 'Support Adult',
      },
      errors: {
        missingName: 'Add your name.',
        missingCredentials: 'Email and password are required.',
        incorrectCredentials: 'Email or password is incorrect.',
        duplicateEmail: 'This email already has a Steady account.',
        requestFailed: 'Request failed. Please try again.',
      },
    },
  },
  ru: {
    signin: {
      eyebrow: 'С возвращением',
      title: 'Рады снова видеть вас',
      subtitle: 'Откройте семейную картину дня.',
      primary: 'Войти',
      back: 'Назад На Публичный Сайт',
      switchLabel: 'Нужен новый аккаунт?',
      switchAction: 'Создать аккаунт',
      working: 'Выполняется...',
      fields: {
        fullName: 'Полное Имя',
        role: 'Роль',
        organization: 'Клиника / Организация',
        email: 'Email',
        password: 'Пароль',
      },
      placeholders: {
        fullName: 'Анна Иванова',
        organization: 'Необязательно',
        email: 'you@example.com',
        password: 'Введите пароль',
      },
      roles: {
        parent: 'Родитель',
        adult: 'Взрослый С Диабетом',
        caregiver: 'Помогающий Взрослый',
      },
      errors: {
        missingName: 'Добавьте имя, чтобы пространство ощущалось персональным.',
        missingCredentials: 'Нужны email и пароль.',
        incorrectCredentials: 'Неверный email или пароль.',
        duplicateEmail: 'Для этого email уже существует аккаунт Steady.',
        requestFailed: 'Запрос не выполнен. Попробуйте ещё раз.',
      },
    },
    signup: {
      eyebrow: 'Присоединиться',
      title: 'Создайте семейное пространство',
      subtitle: 'Для типа 1 или 2 — дети, родители и близкие взрослые.',
      primary: 'Создать Аккаунт',
      back: 'Назад На Публичный Сайт',
      switchLabel: 'Аккаунт уже создан?',
      switchAction: 'Войти',
      working: 'Выполняется...',
      fields: {
        fullName: 'Полное Имя',
        role: 'Роль',
        organization: 'Клиника / Организация',
        email: 'Email',
        password: 'Пароль',
      },
      placeholders: {
        fullName: 'Анна Иванова',
        organization: 'Необязательно',
        email: 'you@example.com',
        password: 'Придумайте пароль',
      },
      roles: {
        parent: 'Родитель',
        adult: 'Взрослый С Диабетом',
        caregiver: 'Помогающий Взрослый',
      },
      errors: {
        missingName: 'Добавьте имя, чтобы пространство ощущалось персональным.',
        missingCredentials: 'Нужны email и пароль.',
        incorrectCredentials: 'Неверный email или пароль.',
        duplicateEmail: 'Для этого email уже существует аккаунт Steady.',
        requestFailed: 'Запрос не выполнен. Попробуйте ещё раз.',
      },
    },
  },
  uk: {
    signin: {
      eyebrow: 'Доступ Для Учасників',
      title: 'Відкрийте вашу картину дня',
      subtitle: 'Увійдіть, щоб відкрити щоденний огляд підтримки.',
      primary: 'Відкрити Картину Дня',
      back: 'Назад На Публічний Сайт',
      switchLabel: 'Потрібен новий акаунт?',
      switchAction: 'Створити акаунт',
      working: 'Виконується...',
      fields: {
        fullName: 'Повне Імʼя',
        role: 'Роль',
        organization: 'Клініка / Організація',
        email: 'Email',
        password: 'Пароль',
      },
      placeholders: {
        fullName: 'Анна Іванова',
        organization: 'Необовʼязково',
        email: 'you@example.com',
        password: 'Введіть пароль',
      },
      roles: {
        parent: 'Батько Або Мати',
        adult: 'Дорослий З Діабетом',
        caregiver: 'Дорослий Для Підтримки',
      },
      errors: {
        missingName: 'Додайте імʼя, щоб простір відчувався персональним.',
        missingCredentials: 'Потрібні email і пароль.',
        incorrectCredentials: 'Неправильний email або пароль.',
        duplicateEmail: 'Для цього email уже існує акаунт Steady.',
        requestFailed: 'Запит не виконано. Спробуйте ще раз.',
      },
    },
    signup: {
      eyebrow: 'Створення Акаунта',
      title: 'Створіть окремий Steady-акаунт',
      subtitle: 'Створіть акаунт Steady для щоденної підтримки родини.',
      primary: 'Створити Акаунт',
      back: 'Назад На Публічний Сайт',
      switchLabel: 'Акаунт уже створено?',
      switchAction: 'Увійти',
      working: 'Виконується...',
      fields: {
        fullName: 'Повне Імʼя',
        role: 'Роль',
        organization: 'Клініка / Організація',
        email: 'Email',
        password: 'Пароль',
      },
      placeholders: {
        fullName: 'Анна Іванова',
        organization: 'Необовʼязково',
        email: 'you@example.com',
        password: 'Придумайте пароль',
      },
      roles: {
        parent: 'Батько Або Мати',
        adult: 'Дорослий З Діабетом',
        caregiver: 'Дорослий Для Підтримки',
      },
      errors: {
        missingName: 'Додайте імʼя, щоб простір відчувався персональним.',
        missingCredentials: 'Потрібні email і пароль.',
        incorrectCredentials: 'Неправильний email або пароль.',
        duplicateEmail: 'Для цього email уже існує акаунт Steady.',
        requestFailed: 'Запит не виконано. Спробуйте ще раз.',
      },
    },
  },
  es: {
    signin: {
      eyebrow: 'Acceso De Miembros',
      title: 'Abre tu espacio de apoyo Steady',
      subtitle: 'Usa tu cuenta de Steady para entrar en tu área de apoyo.',
      primary: 'Abrir Espacio',
      back: 'Volver Al Sitio Público',
      switchLabel: '¿Necesitas una cuenta nueva?',
      switchAction: 'Crear cuenta',
      working: 'Procesando...',
      fields: {
        fullName: 'Nombre Completo',
        role: 'Rol',
        organization: 'Clínica / Organización',
        email: 'Email',
        password: 'Contraseña',
      },
      placeholders: {
        fullName: 'Ana García',
        organization: 'Opcional',
        email: 'you@example.com',
        password: 'Introduce tu contraseña',
      },
      roles: {
        parent: 'Padre O Madre',
        adult: 'Adulto Con Diabetes',
        caregiver: 'Adulto De Apoyo',
      },
      errors: {
        missingName: 'Añade un nombre para que el espacio se sienta personal.',
        missingCredentials: 'El email y la contraseña son obligatorios.',
        incorrectCredentials: 'El email o la contraseña son incorrectos.',
        duplicateEmail: 'Este email ya tiene una cuenta de Steady.',
        requestFailed: 'La solicitud falló. Inténtalo de nuevo.',
      },
    },
    signup: {
      eyebrow: 'Crear Cuenta',
      title: 'Crea tu cuenta Steady',
      subtitle: 'Crea tu cuenta Steady para el apoyo familiar diario.',
      primary: 'Crear Espacio',
      back: 'Volver Al Sitio Público',
      switchLabel: '¿Ya tienes una cuenta?',
      switchAction: 'Iniciar sesión',
      working: 'Procesando...',
      fields: {
        fullName: 'Nombre Completo',
        role: 'Rol',
        organization: 'Clínica / Organización',
        email: 'Email',
        password: 'Contraseña',
      },
      placeholders: {
        fullName: 'Ana García',
        organization: 'Opcional',
        email: 'you@example.com',
        password: 'Elige una contraseña',
      },
      roles: {
        parent: 'Padre O Madre',
        adult: 'Adulto Con Diabetes',
        caregiver: 'Adulto De Apoyo',
      },
      errors: {
        missingName: 'Añade un nombre para que el espacio se sienta personal.',
        missingCredentials: 'El email y la contraseña son obligatorios.',
        incorrectCredentials: 'El email o la contraseña son incorrectos.',
        duplicateEmail: 'Este email ya tiene una cuenta de Steady.',
        requestFailed: 'La solicitud falló. Inténtalo de nuevo.',
      },
    },
  },
  fr: {
    signin: {
      eyebrow: 'Accès Membre',
      title: 'Ouvrez votre espace Steady',
      subtitle: 'Utilisez votre compte Steady pour accéder à votre espace de soutien.',
      primary: 'Ouvrir L’Espace',
      back: 'Retour Au Site Public',
      switchLabel: 'Besoin d’un nouveau compte ?',
      switchAction: 'Créer un compte',
      working: 'Traitement...',
      fields: {
        fullName: 'Nom Complet',
        role: 'Rôle',
        organization: 'Clinique / Organisation',
        email: 'Email',
        password: 'Mot De Passe',
      },
      placeholders: {
        fullName: 'Anne Martin',
        organization: 'Optionnel',
        email: 'you@example.com',
        password: 'Entrez votre mot de passe',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adulte Vivant Avec Un Diabète',
        caregiver: 'Adulte De Soutien',
      },
      errors: {
        missingName: 'Ajoutez un nom pour que l’espace soit plus personnel.',
        missingCredentials: 'L’email et le mot de passe sont requis.',
        incorrectCredentials: 'L’email ou le mot de passe est incorrect.',
        duplicateEmail: 'Cet email possède déjà un compte Steady.',
        requestFailed: 'La requête a échoué. Réessayez.',
      },
    },
    signup: {
      eyebrow: 'Créer Un Compte',
      title: 'Créez votre compte Steady',
      subtitle: 'Créez votre compte Steady pour le soutien familial quotidien.',
      primary: 'Créer L’Espace',
      back: 'Retour Au Site Public',
      switchLabel: 'Vous avez déjà un compte ?',
      switchAction: 'Se connecter',
      working: 'Traitement...',
      fields: {
        fullName: 'Nom Complet',
        role: 'Rôle',
        organization: 'Clinique / Organisation',
        email: 'Email',
        password: 'Mot De Passe',
      },
      placeholders: {
        fullName: 'Anne Martin',
        organization: 'Optionnel',
        email: 'you@example.com',
        password: 'Choisissez un mot de passe',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adulte Vivant Avec Un Diabète',
        caregiver: 'Adulte De Soutien',
      },
      errors: {
        missingName: 'Ajoutez un nom pour que l’espace soit plus personnel.',
        missingCredentials: 'L’email et le mot de passe sont requis.',
        incorrectCredentials: 'L’email ou le mot de passe est incorrect.',
        duplicateEmail: 'Cet email possède déjà un compte Steady.',
        requestFailed: 'La requête a échoué. Réessayez.',
      },
    },
  },
  de: {
    signin: {
      eyebrow: 'Mitgliederzugang',
      title: 'Öffnen Sie Ihren Steady-Bereich',
      subtitle: 'Verwenden Sie Ihr Steady-Konto, um Ihren Unterstützungsbereich zu öffnen.',
      primary: 'Bereich Öffnen',
      back: 'Zurück Zur Öffentlichen Seite',
      switchLabel: 'Brauchen Sie ein neues Konto?',
      switchAction: 'Konto erstellen',
      working: 'Wird ausgeführt...',
      fields: {
        fullName: 'Vollständiger Name',
        role: 'Rolle',
        organization: 'Klinik / Organisation',
        email: 'Email',
        password: 'Passwort',
      },
      placeholders: {
        fullName: 'Anna Weber',
        organization: 'Optional',
        email: 'you@example.com',
        password: 'Passwort eingeben',
      },
      roles: {
        parent: 'Elternteil',
        adult: 'Erwachsene Person Mit Diabetes',
        caregiver: 'Betreuungsperson',
      },
      errors: {
        missingName: 'Bitte geben Sie einen Namen an, damit sich der Bereich persönlicher anfühlt.',
        missingCredentials: 'Email und Passwort sind erforderlich.',
        incorrectCredentials: 'Email oder Passwort sind falsch.',
        duplicateEmail: 'Diese Email hat bereits ein Steady-Konto.',
        requestFailed: 'Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.',
      },
    },
    signup: {
      eyebrow: 'Konto Erstellen',
      title: 'Erstellen Sie Ihr Steady-Konto',
      subtitle: 'Erstellen Sie Ihr Steady-Konto für die tägliche Familienunterstützung.',
      primary: 'Bereich Erstellen',
      back: 'Zurück Zur Öffentlichen Seite',
      switchLabel: 'Konto bereits erstellt?',
      switchAction: 'Anmelden',
      working: 'Wird ausgeführt...',
      fields: {
        fullName: 'Vollständiger Name',
        role: 'Rolle',
        organization: 'Klinik / Organisation',
        email: 'Email',
        password: 'Passwort',
      },
      placeholders: {
        fullName: 'Anna Weber',
        organization: 'Optional',
        email: 'you@example.com',
        password: 'Passwort wählen',
      },
      roles: {
        parent: 'Elternteil',
        adult: 'Erwachsene Person Mit Diabetes',
        caregiver: 'Betreuungsperson',
      },
      errors: {
        missingName: 'Bitte geben Sie einen Namen an, damit sich der Bereich persönlicher anfühlt.',
        missingCredentials: 'Email und Passwort sind erforderlich.',
        incorrectCredentials: 'Email oder Passwort sind falsch.',
        duplicateEmail: 'Diese Email hat bereits ein Steady-Konto.',
        requestFailed: 'Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.',
      },
    },
  },
  zh: {
    signin: {
      eyebrow: '成员访问',
      title: '打开你的 Steady 支持空间',
      subtitle: '使用你的 Steady 账户进入你的支持区域。',
      primary: '打开空间',
      back: '返回公开网站',
      switchLabel: '需要新账户？',
      switchAction: '创建账户',
      working: '处理中...',
      fields: {
        fullName: '全名',
        role: '角色',
        organization: '诊所 / 机构',
        email: '邮箱',
        password: '密码',
      },
      placeholders: {
        fullName: '安娜 王',
        organization: '可选',
        email: 'you@example.com',
        password: '输入你的密码',
      },
      roles: {
        parent: '家长',
        adult: '患有糖尿病的成年人',
        caregiver: '支持的大人',
      },
      errors: {
        missingName: '请填写姓名，这样这个空间会更有个人感。',
        missingCredentials: '邮箱和密码为必填项。',
        incorrectCredentials: '邮箱或密码不正确。',
        duplicateEmail: '此邮箱已经有一个 Steady 账户。',
        requestFailed: '请求失败。请再试一次。',
      },
    },
    signup: {
      eyebrow: '创建账户',
      title: '创建你的 Steady 账户',
      subtitle: '创建 Steady 账户，用于日常家庭支持。',
      primary: '创建空间',
      back: '返回公开网站',
      switchLabel: '已经有账户了？',
      switchAction: '登录',
      working: '处理中...',
      fields: {
        fullName: '全名',
        role: '角色',
        organization: '诊所 / 机构',
        email: '邮箱',
        password: '密码',
      },
      placeholders: {
        fullName: '安娜 王',
        organization: '可选',
        email: 'you@example.com',
        password: '设置密码',
      },
      roles: {
        parent: '家长',
        adult: '患有糖尿病的成年人',
        caregiver: '支持的大人',
      },
      errors: {
        missingName: '请填写姓名，这样这个空间会更有个人感。',
        missingCredentials: '邮箱和密码为必填项。',
        incorrectCredentials: '邮箱或密码不正确。',
        duplicateEmail: '此邮箱已经有一个 Steady 账户。',
        requestFailed: '请求失败。请再试一次。',
      },
    },
  },
  ja: {
    signin: {
      eyebrow: 'メンバーアクセス',
      title: 'Steady の支援スペースを開く',
      subtitle: 'Steady アカウントを使って支援エリアに入ります。',
      primary: 'スペースを開く',
      back: '公開サイトへ戻る',
      switchLabel: '新しいアカウントが必要ですか？',
      switchAction: 'アカウントを作成',
      working: '処理中...',
      fields: {
        fullName: '氏名',
        role: '役割',
        organization: 'クリニック / 組織',
        email: 'メール',
        password: 'パスワード',
      },
      placeholders: {
        fullName: 'Anna Sato',
        organization: '任意',
        email: 'you@example.com',
        password: 'パスワードを入力',
      },
      roles: {
        parent: '保護者',
        adult: '糖尿病のある成人',
        caregiver: '支える大人',
      },
      errors: {
        missingName: 'この空間を自分のものとして感じられるよう、名前を入力してください。',
        missingCredentials: 'メールとパスワードは必須です。',
        incorrectCredentials: 'メールまたはパスワードが正しくありません。',
        duplicateEmail: 'このメールにはすでに Steady アカウントがあります。',
        requestFailed: 'リクエストに失敗しました。もう一度お試しください。',
      },
    },
    signup: {
      eyebrow: 'アカウント作成',
      title: 'Steady アカウントを作成する',
      subtitle: '日常の家族サポートのために Steady アカウントを作成します。',
      primary: 'スペースを作成',
      back: '公開サイトへ戻る',
      switchLabel: 'すでにアカウントがありますか？',
      switchAction: 'サインイン',
      working: '処理中...',
      fields: {
        fullName: '氏名',
        role: '役割',
        organization: 'クリニック / 組織',
        email: 'メール',
        password: 'パスワード',
      },
      placeholders: {
        fullName: 'Anna Sato',
        organization: '任意',
        email: 'you@example.com',
        password: 'パスワードを選択',
      },
      roles: {
        parent: '保護者',
        adult: '糖尿病のある成人',
        caregiver: '支える大人',
      },
      errors: {
        missingName: 'この空間を自分のものとして感じられるよう、名前を入力してください。',
        missingCredentials: 'メールとパスワードは必須です。',
        incorrectCredentials: 'メールまたはパスワードが正しくありません。',
        duplicateEmail: 'このメールにはすでに Steady アカウントがあります。',
        requestFailed: 'リクエストに失敗しました。もう一度お試しください。',
      },
    },
  },
  pt: {
    signin: {
      eyebrow: 'Acesso De Membros',
      title: 'Abra seu espaço de apoio Steady',
      subtitle: 'Use sua conta Steady para entrar na sua área de apoio.',
      primary: 'Abrir Espaço',
      back: 'Voltar Ao Site Público',
      switchLabel: 'Precisa de uma nova conta?',
      switchAction: 'Criar conta',
      working: 'Processando...',
      fields: {
        fullName: 'Nome Completo',
        role: 'Função',
        organization: 'Clínica / Organização',
        email: 'Email',
        password: 'Senha',
      },
      placeholders: {
        fullName: 'Ana Souza',
        organization: 'Opcional',
        email: 'you@example.com',
        password: 'Digite sua senha',
      },
      roles: {
        parent: 'Responsável',
        adult: 'Adulto Com Diabetes',
        caregiver: 'Adulto De Apoio',
      },
      errors: {
        missingName: 'Adicione um nome para que o espaço pareça pessoal.',
        missingCredentials: 'Email e senha são obrigatórios.',
        incorrectCredentials: 'Email ou senha incorretos.',
        duplicateEmail: 'Este email já possui uma conta Steady.',
        requestFailed: 'A solicitação falhou. Tente novamente.',
      },
    },
    signup: {
      eyebrow: 'Criar Conta',
      title: 'Crie sua conta Steady',
      subtitle: 'Crie sua conta Steady para o apoio familiar diário.',
      primary: 'Criar Espaço',
      back: 'Voltar Ao Site Público',
      switchLabel: 'Já criou uma conta?',
      switchAction: 'Entrar',
      working: 'Processando...',
      fields: {
        fullName: 'Nome Completo',
        role: 'Função',
        organization: 'Clínica / Organização',
        email: 'Email',
        password: 'Senha',
      },
      placeholders: {
        fullName: 'Ana Souza',
        organization: 'Opcional',
        email: 'you@example.com',
        password: 'Escolha uma senha',
      },
      roles: {
        parent: 'Responsável',
        adult: 'Adulto Com Diabetes',
        caregiver: 'Adulto De Apoio',
      },
      errors: {
        missingName: 'Adicione um nome para que o espaço pareça pessoal.',
        missingCredentials: 'Email e senha são obrigatórios.',
        incorrectCredentials: 'Email ou senha incorretos.',
        duplicateEmail: 'Este email já possui uma conta Steady.',
        requestFailed: 'A solicitação falhou. Tente novamente.',
      },
    },
  },
  he: {
    signin: {
      eyebrow: 'גישת חברים',
      title: 'פתחו את מרחב התמיכה של Steady',
      subtitle: 'השתמשו בחשבון ה-Steady שלכם כדי להיכנס לאזור התמיכה שלכם.',
      primary: 'פתח מרחב',
      back: 'חזרה לאתר הציבורי',
      switchLabel: 'צריך חשבון חדש?',
      switchAction: 'יצירת חשבון',
      working: 'מבצע...',
      fields: {
        fullName: 'שם מלא',
        role: 'תפקיד',
        organization: 'קליניקה / ארגון',
        email: 'אימייל',
        password: 'סיסמה',
      },
      placeholders: {
        fullName: 'אנה לוי',
        organization: 'אופציונלי',
        email: 'you@example.com',
        password: 'הכניסו את הסיסמה שלכם',
      },
      roles: {
        parent: 'הורה',
        adult: 'מבוגר שחי עם Steady',
        caregiver: 'מבוגר תומך',
      },
      errors: {
        missingName: 'אנא הוסיפו שם כדי שהמרחב ירגיש אישי.',
        missingCredentials: 'נדרשים אימייל וסיסמה.',
        incorrectCredentials: 'האימייל או הסיסמה שגויים.',
        duplicateEmail: 'לאימייל הזה כבר יש חשבון Steady.',
        requestFailed: 'הבקשה נכשלה. נסו שוב.',
      },
    },
    signup: {
      eyebrow: 'יצירת חשבון',
      title: 'צרו את חשבון ה-Steady שלכם',
      subtitle: 'צרו חשבון Steady לתמיכה משפחתית יומית.',
      primary: 'צור מרחב',
      back: 'חזרה לאתר הציבורי',
      switchLabel: 'כבר יצרתם חשבון?',
      switchAction: 'התחברות',
      working: 'מבצע...',
      fields: {
        fullName: 'שם מלא',
        role: 'תפקיד',
        organization: 'קליניקה / ארגון',
        email: 'אימייל',
        password: 'סיסמה',
      },
      placeholders: {
        fullName: 'אנה לוי',
        organization: 'אופציונלי',
        email: 'you@example.com',
        password: 'בחרו סיסמה',
      },
      roles: {
        parent: 'הורה',
        adult: 'מבוגר שחי עם Steady',
        caregiver: 'מבוגר תומך',
      },
      errors: {
        missingName: 'אנא הוסיפו שם כדי שהמרחב ירגיש אישי.',
        missingCredentials: 'נדרשים אימייל וסיסמה.',
        incorrectCredentials: 'האימייל או הסיסמה שגויים.',
        duplicateEmail: 'לאימייל הזה כבר יש חשבון Steady.',
        requestFailed: 'הבקשה נכשלה. נסו שוב.',
      },
    },
  },
  ar: {
    signin: {
      eyebrow: 'وصول الأعضاء',
      title: 'افتح مساحة الدعم الخاصة بك',
      subtitle: 'استخدم حساب Steady الخاص بك للدخول إلى منطقة الدعم الخاصة بك.',
      primary: 'افتح المساحة',
      back: 'العودة إلى الموقع العام',
      switchLabel: 'هل تحتاج إلى حساب جديد؟',
      switchAction: 'إنشاء حساب',
      working: 'جار التنفيذ...',
      fields: {
        fullName: 'الاسم الكامل',
        role: 'الدور',
        organization: 'العيادة / المؤسسة',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
      },
      placeholders: {
        fullName: 'آنا علي',
        organization: 'اختياري',
        email: 'you@example.com',
        password: 'أدخل كلمة المرور',
      },
      roles: {
        parent: 'ولي أمر',
        adult: 'بالغ يعيش مع السكري',
        caregiver: 'شخص بالغ داعم',
      },
      errors: {
        missingName: 'يرجى إضافة اسم حتى تبدو مساحة العمل شخصية.',
        missingCredentials: 'البريد الإلكتروني وكلمة المرور مطلوبان.',
        incorrectCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحين.',
        duplicateEmail: 'هذا البريد الإلكتروني لديه بالفعل حساب Steady.',
        requestFailed: 'فشل الطلب. حاول مرة أخرى.',
      },
    },
    signup: {
      eyebrow: 'إنشاء حساب',
      title: 'أنشئ حساب Steady الخاص بك',
      subtitle: 'أنشئ حساب Steady لدعم الأسرة اليومي.',
      primary: 'أنشئ المساحة',
      back: 'العودة إلى الموقع العام',
      switchLabel: 'هل لديك حساب بالفعل؟',
      switchAction: 'تسجيل الدخول',
      working: 'جار التنفيذ...',
      fields: {
        fullName: 'الاسم الكامل',
        role: 'الدور',
        organization: 'العيادة / المؤسسة',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
      },
      placeholders: {
        fullName: 'آنا علي',
        organization: 'اختياري',
        email: 'you@example.com',
        password: 'اختر كلمة مرور',
      },
      roles: {
        parent: 'ولي أمر',
        adult: 'بالغ يعيش مع السكري',
        caregiver: 'شخص بالغ داعم',
      },
      errors: {
        missingName: 'يرجى إضافة اسم حتى تبدو مساحة العمل شخصية.',
        missingCredentials: 'البريد الإلكتروني وكلمة المرور مطلوبان.',
        incorrectCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحين.',
        duplicateEmail: 'هذا البريد الإلكتروني لديه بالفعل حساب Steady.',
        requestFailed: 'فشل الطلب. حاول مرة أخرى.',
      },
    },
  },
};

export const RESET_COPY: Record<Language, {
  forgot: string;
  sendLink: string;
  tokenPlaceholder: string;
  updatePassword: string;
  passwordUpdated: string;
}> = {
  en: { forgot: 'Forgot password?', sendLink: 'Send reset link', tokenPlaceholder: 'Reset token', updatePassword: 'Update password', passwordUpdated: 'Password updated. Sign in again.' },
  ru: { forgot: 'Забыли пароль?', sendLink: 'Отправить сброс', tokenPlaceholder: 'Токен сброса', updatePassword: 'Обновить пароль', passwordUpdated: 'Пароль обновлён. Войдите снова.' },
  uk: { forgot: 'Забули пароль?', sendLink: 'Надіслати скидання', tokenPlaceholder: 'Токен скидання', updatePassword: 'Оновити пароль', passwordUpdated: 'Пароль оновлено. Увійдіть знову.' },
  es: { forgot: '¿Olvidaste tu contraseña?', sendLink: 'Enviar enlace de restablecimiento', tokenPlaceholder: 'Token de restablecimiento', updatePassword: 'Actualizar contraseña', passwordUpdated: 'Contraseña actualizada. Inicia sesión de nuevo.' },
  fr: { forgot: 'Mot de passe oublié ?', sendLink: 'Envoyer le lien de réinitialisation', tokenPlaceholder: 'Jeton de réinitialisation', updatePassword: 'Mettre à jour le mot de passe', passwordUpdated: 'Mot de passe mis à jour. Reconnectez-vous.' },
  de: { forgot: 'Passwort vergessen?', sendLink: 'Reset-Link senden', tokenPlaceholder: 'Reset-Token', updatePassword: 'Passwort aktualisieren', passwordUpdated: 'Passwort aktualisiert. Melden Sie sich erneut an.' },
  zh: { forgot: '忘记密码？', sendLink: '发送重置链接', tokenPlaceholder: '重置令牌', updatePassword: '更新密码', passwordUpdated: '密码已更新，请重新登录。' },
  ja: { forgot: 'パスワードをお忘れですか？', sendLink: 'リセットリンクを送信', tokenPlaceholder: 'リセットトークン', updatePassword: 'パスワードを更新', passwordUpdated: 'パスワードを更新しました。再度サインインしてください。' },
  pt: { forgot: 'Esqueceu a senha?', sendLink: 'Enviar link de redefinição', tokenPlaceholder: 'Token de redefinição', updatePassword: 'Atualizar senha', passwordUpdated: 'Senha atualizada. Entre novamente.' },
  he: { forgot: 'שכחתם סיסמה?', sendLink: 'שלח קישור לאיפוס', tokenPlaceholder: 'אסימון איפוס', updatePassword: 'עדכן סיסמה', passwordUpdated: 'הסיסמה עודכנה. התחברו שוב.' },
  ar: { forgot: 'هل نسيت كلمة المرور؟', sendLink: 'إرسال رابط إعادة التعيين', tokenPlaceholder: 'رمز إعادة التعيين', updatePassword: 'تحديث كلمة المرور', passwordUpdated: 'تم تحديث كلمة المرور. سجّل الدخول مرة أخرى.' },
};

export const AUTH_SOCIAL_COPY: Record<Language, {
  google: string;
  orEmail: string;
  showPassword: string;
  hidePassword: string;
  googleUnavailable: string;
  googleFailed: string;
  googleNoAccount: string;
  brandName: string;
}> = {
  en: { google: 'Continue with Google', orEmail: 'Or continue with email', showPassword: 'Show password', hidePassword: 'Hide password', googleUnavailable: 'Google sign-in is not configured yet.', googleFailed: 'Google sign-in failed. Try again or use email.', googleNoAccount: 'No Steady account found for this Google email. Create one first.', brandName: 'Steady' },
  ru: { google: 'Продолжить через Google', orEmail: 'Или продолжить по email', showPassword: 'Показать пароль', hidePassword: 'Скрыть пароль', googleUnavailable: 'Вход через Google пока не настроен.', googleFailed: 'Не удалось войти через Google. Попробуйте снова или используйте email.', googleNoAccount: 'Аккаунт Steady для этого Google email не найден. Сначала создайте его.', brandName: 'Steady' },
  uk: { google: 'Продовжити через Google', orEmail: 'Або продовжити через email', showPassword: 'Показати пароль', hidePassword: 'Приховати пароль', googleUnavailable: 'Вхід через Google ще не налаштовано.', googleFailed: 'Не вдалося увійти через Google. Спробуйте знову або використайте email.', googleNoAccount: 'Обліковий запис Steady для цього Google email не знайдено. Спочатку створіть його.', brandName: 'Steady' },
  es: { google: 'Continuar con Google', orEmail: 'O continuar con email', showPassword: 'Mostrar contraseña', hidePassword: 'Ocultar contraseña', googleUnavailable: 'El inicio con Google aún no está configurado.', googleFailed: 'No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa email.', googleNoAccount: 'No se encontró una cuenta Steady para este email de Google. Créala primero.', brandName: 'Steady' },
  fr: { google: 'Continuer avec Google', orEmail: 'Ou continuer avec email', showPassword: 'Afficher le mot de passe', hidePassword: 'Masquer le mot de passe', googleUnavailable: 'La connexion Google n’est pas encore configurée.', googleFailed: 'Échec de la connexion Google. Réessayez ou utilisez l’email.', googleNoAccount: 'Aucun compte Steady trouvé pour cet email Google. Créez-en un d’abord.', brandName: 'Steady' },
  de: { google: 'Mit Google fortfahren', orEmail: 'Oder mit E-Mail fortfahren', showPassword: 'Passwort anzeigen', hidePassword: 'Passwort verbergen', googleUnavailable: 'Google-Anmeldung ist noch nicht konfiguriert.', googleFailed: 'Google-Anmeldung fehlgeschlagen. Versuchen Sie es erneut oder nutzen Sie E-Mail.', googleNoAccount: 'Kein Steady-Konto für diese Google-E-Mail gefunden. Erstellen Sie zuerst eines.', brandName: 'Steady' },
  zh: { google: '使用 Google 继续', orEmail: '或使用邮箱继续', showPassword: '显示密码', hidePassword: '隐藏密码', googleUnavailable: 'Google 登录尚未配置。', googleFailed: 'Google 登录失败。请重试或使用邮箱。', googleNoAccount: '未找到此 Google 邮箱对应的 Steady 账户。请先创建账户。', brandName: 'Steady' },
  ja: { google: 'Google で続行', orEmail: 'またはメールで続行', showPassword: 'パスワードを表示', hidePassword: 'パスワードを非表示', googleUnavailable: 'Google サインインはまだ設定されていません。', googleFailed: 'Google サインインに失敗しました。再試行するかメールを使ってください。', googleNoAccount: 'この Google メールの Steady アカウントが見つかりません。先に作成してください。', brandName: 'Steady' },
  pt: { google: 'Continuar com Google', orEmail: 'Ou continuar com email', showPassword: 'Mostrar senha', hidePassword: 'Ocultar senha', googleUnavailable: 'O login com Google ainda não está configurado.', googleFailed: 'Falha ao entrar com Google. Tente novamente ou use email.', googleNoAccount: 'Nenhuma conta Steady encontrada para este email do Google. Crie uma primeiro.', brandName: 'Steady' },
  he: { google: 'המשיכו עם Google', orEmail: 'או המשיכו עם אימייל', showPassword: 'הצג סיסמה', hidePassword: 'הסתר סיסמה', googleUnavailable: 'כניסה עם Google עדיין לא מוגדרת.', googleFailed: 'הכניסה עם Google נכשלה. נסו שוב או השתמשו באימייל.', googleNoAccount: 'לא נמצא חשבון Steady לכתובת Google הזו. צרו חשבון קודם.', brandName: 'Steady' },
  ar: { google: 'المتابعة مع Google', orEmail: 'أو المتابعة بالبريد الإلكتروني', showPassword: 'إظهار كلمة المرور', hidePassword: 'إخفاء كلمة المرور', googleUnavailable: 'تسجيل الدخول عبر Google غير مهيأ بعد.', googleFailed: 'فشل تسجيل الدخول عبر Google. حاول مرة أخرى أو استخدم البريد.', googleNoAccount: 'لم يتم العثور على حساب Steady لهذا البريد في Google. أنشئ حسابًا أولًا.', brandName: 'Steady' },
};


