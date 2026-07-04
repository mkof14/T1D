import type { Language } from '../types';

export interface MemberChromeCopy {
  activeAccessSignin: string;
  activeAccessSignup: string;
  activeSetup: string;
  activeWorkspace: string;
  signOut: string;
}

export const MEMBER_CHROME_COPY: Record<Language, MemberChromeCopy> = {
  en: {
    activeAccessSignin: 'Sign in',
    activeAccessSignup: 'Create account',
    activeSetup: 'Member setup',
    activeWorkspace: 'Member workspace',
    signOut: 'Sign out',
  },
  ru: {
    activeAccessSignin: 'Вход',
    activeAccessSignup: 'Создание аккаунта',
    activeSetup: 'Настройка аккаунта',
    activeWorkspace: 'Рабочее пространство',
    signOut: 'Выйти',
  },
  uk: {
    activeAccessSignin: 'Вхід',
    activeAccessSignup: 'Створення акаунта',
    activeSetup: 'Налаштування',
    activeWorkspace: 'Робочий простір',
    signOut: 'Вийти',
  },
  es: {
    activeAccessSignin: 'Iniciar sesión',
    activeAccessSignup: 'Crear cuenta',
    activeSetup: 'Configuración',
    activeWorkspace: 'Espacio de trabajo',
    signOut: 'Salir',
  },
  fr: {
    activeAccessSignin: 'Connexion',
    activeAccessSignup: 'Créer un compte',
    activeSetup: 'Configuration',
    activeWorkspace: 'Espace membre',
    signOut: 'Déconnexion',
  },
  de: {
    activeAccessSignin: 'Anmelden',
    activeAccessSignup: 'Konto erstellen',
    activeSetup: 'Einrichtung',
    activeWorkspace: 'Mitgliederbereich',
    signOut: 'Abmelden',
  },
  zh: {
    activeAccessSignin: '登录',
    activeAccessSignup: '创建账号',
    activeSetup: '成员设置',
    activeWorkspace: '成员工作区',
    signOut: '退出',
  },
  ja: {
    activeAccessSignin: 'サインイン',
    activeAccessSignup: 'アカウント作成',
    activeSetup: 'セットアップ',
    activeWorkspace: 'メンバーワークスペース',
    signOut: 'サインアウト',
  },
  pt: {
    activeAccessSignin: 'Entrar',
    activeAccessSignup: 'Criar conta',
    activeSetup: 'Configuração',
    activeWorkspace: 'Área de membro',
    signOut: 'Sair',
  },
  he: {
    activeAccessSignin: 'התחברות',
    activeAccessSignup: 'יצירת חשבון',
    activeSetup: 'הגדרה',
    activeWorkspace: 'סביבת עבודה',
    signOut: 'יציאה',
  },
  ar: {
    activeAccessSignin: 'تسجيل الدخول',
    activeAccessSignup: 'إنشاء حساب',
    activeSetup: 'الإعداد',
    activeWorkspace: 'مساحة الأعضاء',
    signOut: 'تسجيل الخروج',
  },
};
