import type { Language } from '../types';

export type WorkspaceNowCopy = {
  openTimeline: string;
  allClear: string;
  latestMeal: string;
  responder: string;
  quickActions: string;
  currentState: string;
  yesterdayGlance: string;
};

const en: WorkspaceNowCopy = {
  openTimeline: 'Open timeline',
  allClear: 'All clear',
  latestMeal: 'Latest meal',
  responder: 'Responder',
  quickActions: 'Quick actions',
  currentState: 'Current state',
  yesterdayGlance: 'Yesterday at a glance',
};

const ru: WorkspaceNowCopy = {
  openTimeline: 'Открыть хронологию',
  allClear: 'Всё в порядке',
  latestMeal: 'Последний приём пищи',
  responder: 'Ответственный',
  quickActions: 'Быстрые действия',
  currentState: 'Текущее состояние',
  yesterdayGlance: 'Вчерашний итог',
};

export const WORKSPACE_NOW_COPY: Record<Language, WorkspaceNowCopy> = {
  en,
  ru,
  uk: {
    openTimeline: 'Відкрити хронологію',
    allClear: 'Усе гаразд',
    latestMeal: 'Останній прийом їжі',
    responder: 'Відповідальний',
    quickActions: 'Швидкі дії',
    currentState: 'Поточний стан',
    yesterdayGlance: 'Підсумок учора',
  },
  es: {
    openTimeline: 'Abrir línea de tiempo',
    allClear: 'Todo bien',
    latestMeal: 'Última comida',
    responder: 'Respondedor',
    quickActions: 'Acciones rápidas',
    currentState: 'Estado actual',
    yesterdayGlance: 'Ayer de un vistazo',
  },
  fr: {
    openTimeline: 'Ouvrir la chronologie',
    allClear: 'Tout va bien',
    latestMeal: 'Dernier repas',
    responder: 'Répondant',
    quickActions: 'Actions rapides',
    currentState: 'État actuel',
    yesterdayGlance: 'Hier en bref',
  },
  de: {
    openTimeline: 'Timeline öffnen',
    allClear: 'Alles in Ordnung',
    latestMeal: 'Letzte Mahlzeit',
    responder: 'Verantwortlich',
    quickActions: 'Schnellaktionen',
    currentState: 'Aktueller Zustand',
    yesterdayGlance: 'Gestern auf einen Blick',
  },
  zh: {
    openTimeline: '打开时间线',
    allClear: '一切正常',
    latestMeal: '最近一餐',
    responder: '响应人',
    quickActions: '快捷操作',
    currentState: '当前状态',
    yesterdayGlance: '昨日概览',
  },
  ja: {
    openTimeline: 'タイムラインを開く',
    allClear: '問題なし',
    latestMeal: '直近の食事',
    responder: '対応者',
    quickActions: 'クイック操作',
    currentState: '現在の状態',
    yesterdayGlance: '昨日の概要',
  },
  pt: {
    openTimeline: 'Abrir linha do tempo',
    allClear: 'Tudo certo',
    latestMeal: 'Última refeição',
    responder: 'Responsável',
    quickActions: 'Ações rápidas',
    currentState: 'Estado atual',
    yesterdayGlance: 'Ontem em resumo',
  },
  he: {
    openTimeline: 'פתחו ציר זמן',
    allClear: 'הכול בסדר',
    latestMeal: 'ארוחה אחרונה',
    responder: 'מטפל',
    quickActions: 'פעולות מהירות',
    currentState: 'מצב נוכחי',
    yesterdayGlance: 'אתמול במבט',
  },
  ar: {
    openTimeline: 'افتح الخط الزمني',
    allClear: 'كل شيء على ما يرام',
    latestMeal: 'آخر وجبة',
    responder: 'المسؤول',
    quickActions: 'إجراءات سريعة',
    currentState: 'الحالة الحالية',
    yesterdayGlance: 'أمس بنظرة سريعة',
  },
};
