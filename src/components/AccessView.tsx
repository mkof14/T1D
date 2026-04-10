import React, { useState } from 'react';
import { signIn, signUp } from '../lib/api';
import { Language, ROLE_LABELS, RTL_LANGUAGES, type UserRole } from '../types';

type Mode = 'signin' | 'signup';

export interface AccessUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organization?: string;
}

interface AccessViewProps {
  mode: Mode;
  lang: Language;
  theme: 'light' | 'dark';
  onBack: () => void;
  onSuccess: (user: AccessUser) => void;
  onModeChange: (mode: Mode) => void;
}

interface AccessCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary: string;
  cancel: string;
  back: string;
  switchLabel: string;
  switchAction: string;
  working: string;
  helperCards: [string, string, string];
  emptyState: string;
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

const COPY: Record<Language, Record<Mode, AccessCopy>> = {
  en: {
    signin: {
      eyebrow: 'Member Access',
      title: 'Open your daily view',
      subtitle: 'Use your T1D account to continue into your daily support view.',
      primary: 'Open Daily View',
      cancel: 'Cancel',
      back: 'Back To Public Site',
      switchLabel: 'Need a new account?',
      switchAction: 'Create account',
      working: 'Working...',
      helperCards: [
        'A separate sign-in just for T1D.',
        'Kept apart from the main Luna account area.',
        'Helps daily support stay simple and reliable.',
      ],
      emptyState: 'No T1D account was found for this email yet. Create one first.',
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
        email: 'you@project.local',
        password: 'Enter your password',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adult Living With T1D',
        caregiver: 'Support Adult',
      },
      errors: {
        missingName: 'Please add a name so the space feels personal.',
        missingCredentials: 'Email and password are required.',
        incorrectCredentials: 'Email or password is incorrect.',
        duplicateEmail: 'This email already has a T1D account.',
        requestFailed: 'Request failed. Please try again.',
      },
    },
    signup: {
      eyebrow: 'Create Account',
      title: 'Create your T1D account',
      subtitle: 'This account is separate from Luna so your daily support view stays simple and focused.',
      primary: 'Create Account',
      cancel: 'Cancel',
      back: 'Back To Public Site',
      switchLabel: 'Already created one?',
      switchAction: 'Sign in',
      working: 'Working...',
      helperCards: [
        'Creates a dedicated account just for T1D.',
        'Keeps this product separate from the main Luna app.',
        'Supports parent, adult, and support-adult access.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Choose a password',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adult Living With T1D',
        caregiver: 'Support Adult',
      },
      errors: {
        missingName: 'Please add a name so the space feels personal.',
        missingCredentials: 'Email and password are required.',
        incorrectCredentials: 'Email or password is incorrect.',
        duplicateEmail: 'This email already has a T1D account.',
        requestFailed: 'Request failed. Please try again.',
      },
    },
  },
  ru: {
    signin: {
      eyebrow: 'Доступ Для Участников',
      title: 'Откройте вашу картину дня',
      subtitle: 'Используйте ваш T1D-аккаунт, чтобы перейти в ежедневную картину поддержки.',
      primary: 'Открыть Картину Дня',
      cancel: 'Отмена',
      back: 'Назад На Публичный Сайт',
      switchLabel: 'Нужен новый аккаунт?',
      switchAction: 'Создать аккаунт',
      working: 'Выполняется...',
      helperCards: [
        'Отдельный вход только для T1D.',
        'Не смешивается с основным пространством Luna.',
        'Помогает держать ежедневную поддержку простой и надёжной.',
      ],
      emptyState: 'Аккаунт T1D с этим email пока не найден. Сначала создайте его.',
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
        email: 'you@project.local',
        password: 'Введите пароль',
      },
      roles: {
        parent: 'Родитель',
        adult: 'Взрослый С T1D',
        caregiver: 'Помогающий Взрослый',
      },
      errors: {
        missingName: 'Добавьте имя, чтобы пространство ощущалось персональным.',
        missingCredentials: 'Нужны email и пароль.',
        incorrectCredentials: 'Неверный email или пароль.',
        duplicateEmail: 'Для этого email уже существует аккаунт T1D.',
        requestFailed: 'Запрос не выполнен. Попробуйте ещё раз.',
      },
    },
    signup: {
      eyebrow: 'Создание Аккаунта',
      title: 'Создайте ваш T1D-аккаунт',
      subtitle: 'Этот аккаунт отделён от Luna, чтобы ежедневная картина поддержки оставалась простой и понятной.',
      primary: 'Создать Аккаунт',
      cancel: 'Отмена',
      back: 'Назад На Публичный Сайт',
      switchLabel: 'Аккаунт уже создан?',
      switchAction: 'Войти',
      working: 'Выполняется...',
      helperCards: [
        'Создаёт отдельный аккаунт только для T1D.',
        'Не смешивает этот продукт с основным приложением Luna.',
        'Поддерживает роли родителя, взрослого и помогающего взрослого.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Придумайте пароль',
      },
      roles: {
        parent: 'Родитель',
        adult: 'Взрослый С T1D',
        caregiver: 'Помогающий Взрослый',
      },
      errors: {
        missingName: 'Добавьте имя, чтобы пространство ощущалось персональным.',
        missingCredentials: 'Нужны email и пароль.',
        incorrectCredentials: 'Неверный email или пароль.',
        duplicateEmail: 'Для этого email уже существует аккаунт T1D.',
        requestFailed: 'Запрос не выполнен. Попробуйте ещё раз.',
      },
    },
  },
  uk: {
    signin: {
      eyebrow: 'Доступ Для Учасників',
      title: 'Відкрийте вашу картину дня',
      subtitle: 'Використайте ваш T1D-акаунт, щоб перейти до щоденної картини підтримки.',
      primary: 'Відкрити Картину Дня',
      cancel: 'Скасувати',
      back: 'Назад На Публічний Сайт',
      switchLabel: 'Потрібен новий акаунт?',
      switchAction: 'Створити акаунт',
      working: 'Виконується...',
      helperCards: [
        'Окремий вхід лише для T1D.',
        'Не змішується з основним простором Luna.',
        'Допомагає тримати щоденну підтримку простою та надійною.',
      ],
      emptyState: 'Акаунт T1D з цією адресою email поки не знайдено. Спочатку створіть його.',
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
        email: 'you@project.local',
        password: 'Введіть пароль',
      },
      roles: {
        parent: 'Батько Або Мати',
        adult: 'Дорослий З T1D',
        caregiver: 'Дорослий Для Підтримки',
      },
      errors: {
        missingName: 'Додайте імʼя, щоб простір відчувався персональним.',
        missingCredentials: 'Потрібні email і пароль.',
        incorrectCredentials: 'Неправильний email або пароль.',
        duplicateEmail: 'Для цього email уже існує акаунт T1D.',
        requestFailed: 'Запит не виконано. Спробуйте ще раз.',
      },
    },
    signup: {
      eyebrow: 'Створення Акаунта',
      title: 'Створіть окремий T1D-акаунт',
      subtitle: 'Цей акаунт відокремлений від Luna, щоб щоденна картина підтримки залишалася простою і зрозумілою.',
      primary: 'Створити Акаунт',
      cancel: 'Скасувати',
      back: 'Назад На Публічний Сайт',
      switchLabel: 'Акаунт уже створено?',
      switchAction: 'Увійти',
      working: 'Виконується...',
      helperCards: [
        'Створює окремий акаунт лише для T1D.',
        'Не змішує цей продукт з основним застосунком Luna.',
        'Підтримує ролі батьків, дорослого та дорослого для підтримки.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Придумайте пароль',
      },
      roles: {
        parent: 'Батько Або Мати',
        adult: 'Дорослий З T1D',
        caregiver: 'Дорослий Для Підтримки',
      },
      errors: {
        missingName: 'Додайте імʼя, щоб простір відчувався персональним.',
        missingCredentials: 'Потрібні email і пароль.',
        incorrectCredentials: 'Неправильний email або пароль.',
        duplicateEmail: 'Для цього email уже існує акаунт T1D.',
        requestFailed: 'Запит не виконано. Спробуйте ще раз.',
      },
    },
  },
  es: {
    signin: {
      eyebrow: 'Acceso De Miembros',
      title: 'Abre tu espacio de apoyo T1D',
      subtitle: 'Usa tu cuenta de T1D para entrar en tu área de apoyo.',
      primary: 'Abrir Espacio',
      cancel: 'Cancelar',
      back: 'Volver Al Sitio Público',
      switchLabel: '¿Necesitas una cuenta nueva?',
      switchAction: 'Crear cuenta',
      working: 'Procesando...',
      helperCards: [
        'Un acceso separado solo para el producto T1D.',
        'Se mantiene aparte del área principal de Luna.',
        'Ayuda a que el apoyo diario siga siendo simple y fiable.',
      ],
      emptyState: 'Todavía no existe una cuenta de T1D para este email. Créala primero.',
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
        email: 'you@project.local',
        password: 'Introduce tu contraseña',
      },
      roles: {
        parent: 'Padre O Madre',
        adult: 'Adulto Con T1D',
        caregiver: 'Adulto De Apoyo',
      },
      errors: {
        missingName: 'Añade un nombre para que el espacio se sienta personal.',
        missingCredentials: 'El email y la contraseña son obligatorios.',
        incorrectCredentials: 'El email o la contraseña son incorrectos.',
        duplicateEmail: 'Este email ya tiene una cuenta de T1D.',
        requestFailed: 'La solicitud falló. Inténtalo de nuevo.',
      },
    },
    signup: {
      eyebrow: 'Crear Cuenta',
      title: 'Crea tu cuenta T1D',
      subtitle: 'Esta cuenta está separada de Luna para que tu área de apoyo siga siendo simple y clara.',
      primary: 'Crear Espacio',
      cancel: 'Cancelar',
      back: 'Volver Al Sitio Público',
      switchLabel: '¿Ya tienes una cuenta?',
      switchAction: 'Iniciar sesión',
      working: 'Procesando...',
      helperCards: [
        'Crea una cuenta dedicada solo para T1D.',
        'Mantiene este producto separado de la aplicación principal Luna.',
        'Da acceso para padre, adulto y adulto de apoyo.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Elige una contraseña',
      },
      roles: {
        parent: 'Padre O Madre',
        adult: 'Adulto Con T1D',
        caregiver: 'Adulto De Apoyo',
      },
      errors: {
        missingName: 'Añade un nombre para que el espacio se sienta personal.',
        missingCredentials: 'El email y la contraseña son obligatorios.',
        incorrectCredentials: 'El email o la contraseña son incorrectos.',
        duplicateEmail: 'Este email ya tiene una cuenta de T1D.',
        requestFailed: 'La solicitud falló. Inténtalo de nuevo.',
      },
    },
  },
  fr: {
    signin: {
      eyebrow: 'Accès Membre',
      title: 'Ouvrez votre espace T1D',
      subtitle: 'Utilisez votre compte T1D pour accéder à votre espace de soutien.',
      primary: 'Ouvrir L’Espace',
      cancel: 'Annuler',
      back: 'Retour Au Site Public',
      switchLabel: 'Besoin d’un nouveau compte ?',
      switchAction: 'Créer un compte',
      working: 'Traitement...',
      helperCards: [
        'Un accès séparé uniquement pour le produit T1D.',
        'Reste à part de l’espace principal Luna.',
        'Aide à garder le soutien quotidien simple et fiable.',
      ],
      emptyState: 'Aucun compte T1D n’a encore été trouvé pour cet email. Créez-en un d’abord.',
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
        email: 'you@project.local',
        password: 'Entrez votre mot de passe',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adulte Vivant Avec Un T1D',
        caregiver: 'Adulte De Soutien',
      },
      errors: {
        missingName: 'Ajoutez un nom pour que l’espace soit plus personnel.',
        missingCredentials: 'L’email et le mot de passe sont requis.',
        incorrectCredentials: 'L’email ou le mot de passe est incorrect.',
        duplicateEmail: 'Cet email possède déjà un compte T1D.',
        requestFailed: 'La requête a échoué. Réessayez.',
      },
    },
    signup: {
      eyebrow: 'Créer Un Compte',
      title: 'Créez votre compte T1D',
      subtitle: 'Ce compte est séparé de Luna pour garder votre espace de soutien simple et clair.',
      primary: 'Créer L’Espace',
      cancel: 'Annuler',
      back: 'Retour Au Site Public',
      switchLabel: 'Vous avez déjà un compte ?',
      switchAction: 'Se connecter',
      working: 'Traitement...',
      helperCards: [
        'Crée un compte dédié uniquement à T1D.',
        'Garde ce produit séparé de l’application principale Luna.',
        'Prend en charge les accès parent, adulte et adulte de soutien.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Choisissez un mot de passe',
      },
      roles: {
        parent: 'Parent',
        adult: 'Adulte Vivant Avec Un T1D',
        caregiver: 'Adulte De Soutien',
      },
      errors: {
        missingName: 'Ajoutez un nom pour que l’espace soit plus personnel.',
        missingCredentials: 'L’email et le mot de passe sont requis.',
        incorrectCredentials: 'L’email ou le mot de passe est incorrect.',
        duplicateEmail: 'Cet email possède déjà un compte T1D.',
        requestFailed: 'La requête a échoué. Réessayez.',
      },
    },
  },
  de: {
    signin: {
      eyebrow: 'Mitgliederzugang',
      title: 'Öffnen Sie Ihren T1D-Bereich',
      subtitle: 'Verwenden Sie Ihr T1D-Konto, um Ihren Unterstützungsbereich zu öffnen.',
      primary: 'Bereich Öffnen',
      cancel: 'Abbrechen',
      back: 'Zurück Zur Öffentlichen Seite',
      switchLabel: 'Brauchen Sie ein neues Konto?',
      switchAction: 'Konto erstellen',
      working: 'Wird ausgeführt...',
      helperCards: [
        'Ein eigener Zugang nur für das T1D-Produkt.',
        'Getrennt vom Hauptbereich von Luna.',
        'Hilft dabei, die tägliche Unterstützung einfach und verlässlich zu halten.',
      ],
      emptyState: 'Für diese Email wurde noch kein T1D-Konto gefunden. Erstellen Sie zuerst eins.',
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
        email: 'you@project.local',
        password: 'Passwort eingeben',
      },
      roles: {
        parent: 'Elternteil',
        adult: 'Erwachsene Person Mit T1D',
        caregiver: 'Betreuungsperson',
      },
      errors: {
        missingName: 'Bitte geben Sie einen Namen an, damit sich der Bereich persönlicher anfühlt.',
        missingCredentials: 'Email und Passwort sind erforderlich.',
        incorrectCredentials: 'Email oder Passwort sind falsch.',
        duplicateEmail: 'Diese Email hat bereits ein T1D-Konto.',
        requestFailed: 'Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.',
      },
    },
    signup: {
      eyebrow: 'Konto Erstellen',
      title: 'Erstellen Sie Ihr T1D-Konto',
      subtitle: 'Dieses Konto ist von Luna getrennt, damit Ihr Unterstützungsbereich einfach und klar bleibt.',
      primary: 'Bereich Erstellen',
      cancel: 'Abbrechen',
      back: 'Zurück Zur Öffentlichen Seite',
      switchLabel: 'Konto bereits erstellt?',
      switchAction: 'Anmelden',
      working: 'Wird ausgeführt...',
      helperCards: [
        'Erstellt ein eigenes Konto nur für T1D.',
        'Hält dieses Produkt von der Hauptanwendung Luna getrennt.',
        'Unterstützt Eltern-, Erwachsenen- und Unterstützungszugang.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Passwort wählen',
      },
      roles: {
        parent: 'Elternteil',
        adult: 'Erwachsene Person Mit T1D',
        caregiver: 'Betreuungsperson',
      },
      errors: {
        missingName: 'Bitte geben Sie einen Namen an, damit sich der Bereich persönlicher anfühlt.',
        missingCredentials: 'Email und Passwort sind erforderlich.',
        incorrectCredentials: 'Email oder Passwort sind falsch.',
        duplicateEmail: 'Diese Email hat bereits ein T1D-Konto.',
        requestFailed: 'Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.',
      },
    },
  },
  zh: {
    signin: {
      eyebrow: '成员访问',
      title: '打开你的 T1D 支持空间',
      subtitle: '使用你的 T1D 账户进入你的支持区域。',
      primary: '打开空间',
      cancel: '取消',
      back: '返回公开网站',
      switchLabel: '需要新账户？',
      switchAction: '创建账户',
      working: '处理中...',
      helperCards: [
        '这是专门给 T1D 产品使用的独立入口。',
        '与 Luna 主区域分开。',
        '帮助我们让日常支持保持简单和可靠。',
      ],
      emptyState: '此邮箱还没有对应的 T1D 账户。请先创建账户。',
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
        email: 'you@project.local',
        password: '输入你的密码',
      },
      roles: {
        parent: '家长',
        adult: '患有 T1D 的成年人',
        caregiver: '支持的大人',
      },
      errors: {
        missingName: '请填写姓名，这样这个空间会更有个人感。',
        missingCredentials: '邮箱和密码为必填项。',
        incorrectCredentials: '邮箱或密码不正确。',
        duplicateEmail: '此邮箱已经有一个 T1D 账户。',
        requestFailed: '请求失败。请再试一次。',
      },
    },
    signup: {
      eyebrow: '创建账户',
      title: '创建你的 T1D 账户',
      subtitle: '这个账户与 Luna 分开，让你的支持区域保持简单清楚。',
      primary: '创建空间',
      cancel: '取消',
      back: '返回公开网站',
      switchLabel: '已经有账户了？',
      switchAction: '登录',
      working: '处理中...',
      helperCards: [
        '只为 T1D 创建专用账户。',
        '让这个产品与 Luna 主应用保持分开。',
        '支持家长、成年人和支持大人的进入方式。',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: '设置密码',
      },
      roles: {
        parent: '家长',
        adult: '患有 T1D 的成年人',
        caregiver: '支持的大人',
      },
      errors: {
        missingName: '请填写姓名，这样这个空间会更有个人感。',
        missingCredentials: '邮箱和密码为必填项。',
        incorrectCredentials: '邮箱或密码不正确。',
        duplicateEmail: '此邮箱已经有一个 T1D 账户。',
        requestFailed: '请求失败。请再试一次。',
      },
    },
  },
  ja: {
    signin: {
      eyebrow: 'メンバーアクセス',
      title: 'T1D の支援スペースを開く',
      subtitle: 'T1D アカウントを使って支援エリアに入ります。',
      primary: 'スペースを開く',
      cancel: 'キャンセル',
      back: '公開サイトへ戻る',
      switchLabel: '新しいアカウントが必要ですか？',
      switchAction: 'アカウントを作成',
      working: '処理中...',
      helperCards: [
        'T1D 専用の独立した入口です。',
        'Luna のメイン領域とは分かれています。',
        '日々の支援をシンプルで確かなものに保ちます。',
      ],
      emptyState: 'このメールアドレスの T1D アカウントはまだありません。先に作成してください。',
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
        email: 'you@project.local',
        password: 'パスワードを入力',
      },
      roles: {
        parent: '保護者',
        adult: 'T1D のある成人',
        caregiver: '支える大人',
      },
      errors: {
        missingName: 'この空間を自分のものとして感じられるよう、名前を入力してください。',
        missingCredentials: 'メールとパスワードは必須です。',
        incorrectCredentials: 'メールまたはパスワードが正しくありません。',
        duplicateEmail: 'このメールにはすでに T1D アカウントがあります。',
        requestFailed: 'リクエストに失敗しました。もう一度お試しください。',
      },
    },
    signup: {
      eyebrow: 'アカウント作成',
      title: 'T1D アカウントを作成する',
      subtitle: 'このアカウントは Luna と分かれているため、支援スペースをシンプルで分かりやすく保てます。',
      primary: 'スペースを作成',
      cancel: 'キャンセル',
      back: '公開サイトへ戻る',
      switchLabel: 'すでにアカウントがありますか？',
      switchAction: 'サインイン',
      working: '処理中...',
      helperCards: [
        'T1D 専用のアカウントを作成します。',
        'この製品を Luna 本体から切り離して保ちます。',
        '保護者、成人、支える大人の利用を支えます。',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'パスワードを選択',
      },
      roles: {
        parent: '保護者',
        adult: 'T1D のある成人',
        caregiver: '支える大人',
      },
      errors: {
        missingName: 'この空間を自分のものとして感じられるよう、名前を入力してください。',
        missingCredentials: 'メールとパスワードは必須です。',
        incorrectCredentials: 'メールまたはパスワードが正しくありません。',
        duplicateEmail: 'このメールにはすでに T1D アカウントがあります。',
        requestFailed: 'リクエストに失敗しました。もう一度お試しください。',
      },
    },
  },
  pt: {
    signin: {
      eyebrow: 'Acesso De Membros',
      title: 'Abra seu espaço de apoio T1D',
      subtitle: 'Use sua conta T1D para entrar na sua área de apoio.',
      primary: 'Abrir Espaço',
      cancel: 'Cancelar',
      back: 'Voltar Ao Site Público',
      switchLabel: 'Precisa de uma nova conta?',
      switchAction: 'Criar conta',
      working: 'Processando...',
      helperCards: [
        'Um acesso separado só para o produto T1D.',
        'Fica separado da área principal do Luna.',
        'Ajuda a manter o apoio diário simples e confiável.',
      ],
      emptyState: 'Ainda não existe uma conta T1D para este email. Crie uma primeiro.',
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
        email: 'you@project.local',
        password: 'Digite sua senha',
      },
      roles: {
        parent: 'Responsável',
        adult: 'Adulto Com T1D',
        caregiver: 'Adulto De Apoio',
      },
      errors: {
        missingName: 'Adicione um nome para que o espaço pareça pessoal.',
        missingCredentials: 'Email e senha são obrigatórios.',
        incorrectCredentials: 'Email ou senha incorretos.',
        duplicateEmail: 'Este email já possui uma conta T1D.',
        requestFailed: 'A solicitação falhou. Tente novamente.',
      },
    },
    signup: {
      eyebrow: 'Criar Conta',
      title: 'Crie sua conta T1D',
      subtitle: 'Esta conta fica separada do Luna para que sua área de apoio permaneça simples e clara.',
      primary: 'Criar Espaço',
      cancel: 'Cancelar',
      back: 'Voltar Ao Site Público',
      switchLabel: 'Já criou uma conta?',
      switchAction: 'Entrar',
      working: 'Processando...',
      helperCards: [
        'Cria uma conta dedicada apenas ao T1D.',
        'Mantém este produto separado do aplicativo principal Luna.',
        'Dá suporte a acessos de responsável, adulto e adulto de apoio.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'Escolha uma senha',
      },
      roles: {
        parent: 'Responsável',
        adult: 'Adulto Com T1D',
        caregiver: 'Adulto De Apoio',
      },
      errors: {
        missingName: 'Adicione um nome para que o espaço pareça pessoal.',
        missingCredentials: 'Email e senha são obrigatórios.',
        incorrectCredentials: 'Email ou senha incorretos.',
        duplicateEmail: 'Este email já possui uma conta T1D.',
        requestFailed: 'A solicitação falhou. Tente novamente.',
      },
    },
  },
  he: {
    signin: {
      eyebrow: 'גישת חברים',
      title: 'פתחו את מרחב התמיכה של T1D',
      subtitle: 'השתמשו בחשבון ה-T1D שלכם כדי להיכנס לאזור התמיכה שלכם.',
      primary: 'פתח מרחב',
      cancel: 'ביטול',
      back: 'חזרה לאתר הציבורי',
      switchLabel: 'צריך חשבון חדש?',
      switchAction: 'יצירת חשבון',
      working: 'מבצע...',
      helperCards: [
        'כניסה נפרדת שמיועדת רק למוצר T1D.',
        'נשמרת בנפרד מהאזור הראשי של Luna.',
        'עוזרת לשמור על התמיכה היומית פשוטה ואמינה.',
      ],
      emptyState: 'עדיין לא נמצא חשבון T1D עבור האימייל הזה. צרו חשבון תחילה.',
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
        email: 'you@project.local',
        password: 'הכניסו את הסיסמה שלכם',
      },
      roles: {
        parent: 'הורה',
        adult: 'מבוגר שחי עם T1D',
        caregiver: 'מבוגר תומך',
      },
      errors: {
        missingName: 'אנא הוסיפו שם כדי שהמרחב ירגיש אישי.',
        missingCredentials: 'נדרשים אימייל וסיסמה.',
        incorrectCredentials: 'האימייל או הסיסמה שגויים.',
        duplicateEmail: 'לאימייל הזה כבר יש חשבון T1D.',
        requestFailed: 'הבקשה נכשלה. נסו שוב.',
      },
    },
    signup: {
      eyebrow: 'יצירת חשבון',
      title: 'צרו את חשבון ה-T1D שלכם',
      subtitle: 'החשבון הזה נפרד מ-Luna כדי שמרחב התמיכה יישאר פשוט וברור.',
      primary: 'צור מרחב',
      cancel: 'ביטול',
      back: 'חזרה לאתר הציבורי',
      switchLabel: 'כבר יצרתם חשבון?',
      switchAction: 'התחברות',
      working: 'מבצע...',
      helperCards: [
        'יוצר חשבון ייעודי רק ל-T1D.',
        'שומר את המוצר הזה נפרד מאפליקציית Luna הראשית.',
        'תומך בגישת הורה, מבוגר ומבוגר תומך.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'בחרו סיסמה',
      },
      roles: {
        parent: 'הורה',
        adult: 'מבוגר שחי עם T1D',
        caregiver: 'מבוגר תומך',
      },
      errors: {
        missingName: 'אנא הוסיפו שם כדי שהמרחב ירגיש אישי.',
        missingCredentials: 'נדרשים אימייל וסיסמה.',
        incorrectCredentials: 'האימייל או הסיסמה שגויים.',
        duplicateEmail: 'לאימייל הזה כבר יש חשבון T1D.',
        requestFailed: 'הבקשה נכשלה. נסו שוב.',
      },
    },
  },
  ar: {
    signin: {
      eyebrow: 'وصول الأعضاء',
      title: 'افتح مساحة الدعم الخاصة بك',
      subtitle: 'استخدم حساب T1D الخاص بك للدخول إلى منطقة الدعم الخاصة بك.',
      primary: 'افتح المساحة',
      cancel: 'إلغاء',
      back: 'العودة إلى الموقع العام',
      switchLabel: 'هل تحتاج إلى حساب جديد؟',
      switchAction: 'إنشاء حساب',
      working: 'جار التنفيذ...',
      helperCards: [
        'دخول منفصل مخصص فقط لمنتج T1D.',
        'يبقى منفصلًا عن المساحة الرئيسية في Luna.',
        'يساعدنا على إبقاء الدعم اليومي بسيطًا وموثوقًا.',
      ],
      emptyState: 'لا يوجد بعد حساب T1D لهذا البريد الإلكتروني. أنشئ حسابًا أولًا.',
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
        email: 'you@project.local',
        password: 'أدخل كلمة المرور',
      },
      roles: {
        parent: 'ولي أمر',
        adult: 'بالغ يعيش مع T1D',
        caregiver: 'شخص بالغ داعم',
      },
      errors: {
        missingName: 'يرجى إضافة اسم حتى تبدو مساحة العمل شخصية.',
        missingCredentials: 'البريد الإلكتروني وكلمة المرور مطلوبان.',
        incorrectCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحين.',
        duplicateEmail: 'هذا البريد الإلكتروني لديه بالفعل حساب T1D.',
        requestFailed: 'فشل الطلب. حاول مرة أخرى.',
      },
    },
    signup: {
      eyebrow: 'إنشاء حساب',
      title: 'أنشئ حساب T1D الخاص بك',
      subtitle: 'هذا الحساب منفصل عن Luna حتى تبقى مساحة الدعم بسيطة وواضحة.',
      primary: 'أنشئ المساحة',
      cancel: 'إلغاء',
      back: 'العودة إلى الموقع العام',
      switchLabel: 'هل لديك حساب بالفعل؟',
      switchAction: 'تسجيل الدخول',
      working: 'جار التنفيذ...',
      helperCards: [
        'ينشئ حسابًا مخصصًا فقط لـ T1D.',
        'يبقي هذا المنتج منفصلًا عن تطبيق Luna الرئيسي.',
        'يدعم وصول ولي الأمر والبالغ والشخص البالغ الداعم.',
      ],
      emptyState: '',
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
        email: 'you@project.local',
        password: 'اختر كلمة مرور',
      },
      roles: {
        parent: 'ولي أمر',
        adult: 'بالغ يعيش مع T1D',
        caregiver: 'شخص بالغ داعم',
      },
      errors: {
        missingName: 'يرجى إضافة اسم حتى تبدو مساحة العمل شخصية.',
        missingCredentials: 'البريد الإلكتروني وكلمة المرور مطلوبان.',
        incorrectCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحين.',
        duplicateEmail: 'هذا البريد الإلكتروني لديه بالفعل حساب T1D.',
        requestFailed: 'فشل الطلب. حاول مرة أخرى.',
      },
    },
  },
};

const inputTone =
  'h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-900';

const normalizeError = (message: string, copy: AccessCopy) => {
  if (message === 'Email or password is incorrect') return copy.errors.incorrectCredentials;
  if (message === 'This email already has a T1D account') return copy.errors.duplicateEmail;
  if (message === 'Email and password are required') return copy.errors.missingCredentials;
  if (message === 'Request failed') return copy.errors.requestFailed;
  return message || copy.errors.requestFailed;
};

export const AccessView: React.FC<AccessViewProps> = ({ mode, lang, theme, onBack, onSuccess, onModeChange }) => {
  const copy = COPY[lang][mode];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const roleLabels = { ...ROLE_LABELS[lang], ...copy.roles };
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'signin') {
        const response = await signIn({ email, password });
        onSuccess({ ...response.user, password });
        return;
      }

      if (!fullName.trim()) {
        setError(copy.errors.missingName);
        return;
      }

      const response = await signUp({
        email,
        password,
        fullName,
        role,
        organization,
      });
      onSuccess({ ...response.user, password });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '';
      setError(normalizeError(message, copy));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${theme === 'dark' ? 'bg-[#09111a] text-slate-100' : 'bg-[#f3f8fb] text-slate-900'}`}>
      <div className="mx-auto max-w-[1120px] px-4 py-8 md:px-6 md:py-10">
        <button
          type="button"
          onClick={onBack}
          className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${
            theme === 'dark' ? 'border-slate-700 bg-slate-950/70 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
          } ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {copy.back}
        </button>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section
            className={`rounded-[2.2rem] border p-7 md:p-9 ${
              theme === 'dark'
                ? 'border-slate-800 bg-[linear-gradient(145deg,#091423_0%,#0d1a2b_50%,#11263f_100%)]'
                : 'border-slate-200 bg-[linear-gradient(145deg,#f6f8fb_0%,#eef4f8_50%,#f7fbff_100%)]'
            } ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:text-sky-300">{copy.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.subtitle}</p>

            <div className="mt-8 space-y-4">
              {copy.helperCards.map((item) => (
                <div
                  key={item}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-200' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className={`rounded-[2.2rem] border p-7 md:p-9 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/96'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {mode === 'signup' ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{copy.fields.fullName}</label>
                    <input className={`${inputTone} ${isRTL ? 'text-right' : 'text-left'}`} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={copy.placeholders.fullName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{copy.fields.role}</label>
                    <select className={`${inputTone} ${isRTL ? 'text-right' : 'text-left'}`} value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                      <option value="parent">{roleLabels.parent}</option>
                      <option value="adult">{roleLabels.adult}</option>
                      <option value="caregiver">{roleLabels.caregiver}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{copy.fields.organization}</label>
                    <input className={`${inputTone} ${isRTL ? 'text-right' : 'text-left'}`} value={organization} onChange={(event) => setOrganization(event.target.value)} placeholder={copy.placeholders.organization} />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{copy.fields.email}</label>
                <input className={`${inputTone} ${isRTL ? 'text-right' : 'text-left'}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.placeholders.email} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{copy.fields.password}</label>
                <input className={`${inputTone} ${isRTL ? 'text-right' : 'text-left'}`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={copy.placeholders.password} />
              </div>

              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{error}</p> : null}

              <div className={`flex flex-wrap gap-3 pt-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <button
                  type="submit"
                  disabled={busy}
                  className={`rounded-full px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${
                    theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-slate-950 text-white hover:bg-slate-800'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {busy ? copy.working : copy.primary}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className={`rounded-full border px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] ${
                    theme === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
                  }`}
                >
                  {copy.cancel}
                </button>
              </div>

              <div className={`border-t border-slate-200 pt-5 dark:border-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.switchLabel}</p>
                <button
                  type="button"
                  onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                  className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-sky-700 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  {copy.switchAction}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccessView;
