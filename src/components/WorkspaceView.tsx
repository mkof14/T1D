import React from 'react';
import type { AccessUser } from './AccessView';
import type { CurrentStatePayload, SafetyPreferencesInput, SessionDetail, WorkspacePayload } from '../lib/api';
import { RTL_LANGUAGES, type DiabetesType, type Language } from '../types';
import { MEMBER_CHROME_COPY } from '../content/member-chrome-copy';
import { DIABETES_TYPE_COPY, diabetesTypeKey } from '../content/diabetes-type-copy';
import { readSignupDiabetesType } from '../lib/signup-diabetes-type';
import { getRoleLabels } from '../lib/role-labels';
import {
  resolveFailStateHints,
  resolvePreferenceExplainer,
  resolveWorkspaceCopy,
  resolveWorkspaceInviteCopy,
  resolveWorkspaceSectionHeaders,
} from '../lib/workspace-content';
import { ACTION_LABELS } from '../content/action-labels';
import type { ActionId } from '../lib/api';
import { t1dBtnPrimary, t1dBtnSecondary, t1dEyebrow, t1dMemberLayout, t1dPanelCompact, t1dPanelCompactSurface, t1dPanelPrimary, t1dPanelSubtle, t1dPanelSurface, t1dSoftLabel } from '../lib/t1d-ui';
import { MemberZoneShell } from './layout/MemberZoneShell';
import { ConnectionPanel } from './workspace/ConnectionPanel';
import { FoodAnalysisPanel } from './workspace/FoodAnalysisPanel';
import { WorkspaceActionBanner } from './workspace/WorkspaceActionBanner';
import { WorkspaceOnboarding } from './workspace/WorkspaceOnboarding';
import { WorkspaceSectionHeader } from './workspace/WorkspaceSectionHeader';
import { WorkspaceSidebar } from './workspace/WorkspaceSidebar';
import { resolveActionFeedback } from '../content/workspace-ux-copy';
import { NUTRITION_COPY } from '../content/nutrition-copy';
import { createEmptyNutritionPayload } from '../lib/nutrition-defaults';
import { memberLayoutTypeClass } from '../lib/hero-path';
import { glucoseDashboardTypeClass, typeCardClass, workspaceShellTypeClass } from '../lib/diabetes-type-theme';
import { GlucoseNowDashboard } from './workspace/GlucoseNowDashboard';
import { WorkspaceNowPanel } from './workspace/WorkspaceNowPanel';
import { WorkspaceBetaBanner } from './workspace/WorkspaceBetaBanner';
import { AlertFlowDiagram } from './workspace/AlertFlowDiagram';
import { EventTimeline } from './workspace/EventTimeline';
import { DailyHistoryChart } from './workspace/DailyHistoryChart';
import { WORKSPACE_NOW_COPY } from '../content/workspace-now-copy';
import { WORKSPACE_VISUAL_COPY } from '../content/workspace-visual-copy';
import { GLUCOSE_DISPLAY_COPY, glucoseUnitOptionLabel } from '../content/glucose-display-copy';
import { normalizeGlucoseUnit } from '../lib/glucose-units';
import type { WorkspaceSectionId } from '../content/workspace-nav-copy';

interface WorkspaceViewProps {
  user: AccessUser;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onLogout: () => void;
  onBackToPublic: () => void;
  onSignUp: (type: DiabetesType) => void;
  workspace: WorkspacePayload | null;
  onAction: (action: ActionId) => Promise<void>;
  onPreferencesSave: (preferences: SafetyPreferencesInput) => Promise<void>;
  onDexcomConnect: () => Promise<void>;
  onDexcomOAuthStart: () => Promise<void>;
  onDexcomOAuthFinish: (code: string) => Promise<void>;
  onDexcomTokenRefresh: () => Promise<void>;
  onDexcomDisconnect: () => Promise<void>;
  onDexcomPoll: () => Promise<void>;
  onNutritionAnalyze: (payload: { imageBase64?: string; note?: string }) => Promise<void>;
  onWorkspaceRefresh?: () => Promise<void>;
}

const STATE_TONE: Record<CurrentStatePayload['level'], string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300',
  watch: 'bg-amber-100 text-amber-900 dark:bg-amber-500/12 dark:text-amber-200',
  risk: 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300',
  critical: 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300',
  recovery: 'bg-violet-100 text-violet-800 dark:bg-violet-500/12 dark:text-violet-300',
};

const PREFERENCE_COPY: Record<Language, {
  title: string;
  save: string;
  saving: string;
  summary: string;
  explainer: string;
  fields: { day: string; night: string; delay: string; dayContact: string; nightContact: string };
  options: { gentle: string; balanced: string; watchful: string; protective: string; urgent: string; seconds: string };
}> = {
  en: { title: 'Preferences', save: 'Save Preferences', saving: 'Saving', summary: 'Current Setup', explainer: 'These settings make daytime support softer or tighter and decide when backup joins in.', fields: { day: 'Day Sensitivity', night: 'Night Sensitivity', delay: 'Caregiver Delay', dayContact: 'First Day Alert', nightContact: 'First Night Alert' }, options: { gentle: 'Gentle', balanced: 'Balanced', watchful: 'Watchful', protective: 'Protective', urgent: 'Urgent', seconds: 's' } },
  ru: { title: 'Настройки', save: 'Сохранить Настройки', saving: 'Сохранение', summary: 'Текущая Схема', explainer: 'Эти настройки делают дневную поддержку мягче или строже и определяют, когда подключается резерв.', fields: { day: 'Чувствительность Днём', night: 'Чувствительность Ночью', delay: 'Задержка До Резерва', dayContact: 'Первый Сигнал Днём', nightContact: 'Первый Сигнал Ночью' }, options: { gentle: 'Мягко', balanced: 'Сбалансированно', watchful: 'Внимательно', protective: 'Защитно', urgent: 'Срочно', seconds: 'с' } },
  uk: { title: 'Налаштування', save: 'Зберегти Налаштування', saving: 'Збереження', summary: 'Поточна Схема', explainer: 'Ці налаштування роблять денну підтримку м’якшою або щільнішою й визначають, коли підключається резерв.', fields: { day: 'Чутливість Вдень', night: 'Чутливість Вночі', delay: 'Затримка До Резерву', dayContact: 'Перший Сигнал Вдень', nightContact: 'Перший Сигнал Вночі' }, options: { gentle: 'М’яко', balanced: 'Збалансовано', watchful: 'Уважно', protective: 'Захисно', urgent: 'Терміново', seconds: 'с' } },
  es: { title: 'Preferencias', save: 'Guardar Preferencias', saving: 'Guardando', summary: 'Configuración Actual', explainer: 'Estos ajustes hacen que el apoyo diurno sea más suave o más atento y deciden cuándo entra el respaldo.', fields: { day: 'Sensibilidad De Día', night: 'Sensibilidad De Noche', delay: 'Demora Del Apoyo', dayContact: 'Primer Aviso De Día', nightContact: 'Primer Aviso De Noche' }, options: { gentle: 'Suave', balanced: 'Equilibrado', watchful: 'Atento', protective: 'Protector', urgent: 'Urgente', seconds: 's' } },
  fr: { title: 'Préférences', save: 'Enregistrer Les Préférences', saving: 'Enregistrement', summary: 'Configuration Actuelle', explainer: 'Ces réglages rendent le soutien de jour plus doux ou plus serré et décident quand le relais entre en jeu.', fields: { day: 'Sensibilité Jour', night: 'Sensibilité Nuit', delay: 'Délai Du Relais', dayContact: 'Premier Signal Jour', nightContact: 'Premier Signal Nuit' }, options: { gentle: 'Doux', balanced: 'Équilibré', watchful: 'Attentif', protective: 'Protecteur', urgent: 'Urgent', seconds: 's' } },
  de: { title: 'Einstellungen', save: 'Einstellungen Speichern', saving: 'Wird Gespeichert', summary: 'Aktuelle Konfiguration', explainer: 'Diese Einstellungen machen die Unterstützung am Tag weicher oder enger und legen fest, wann die Reserve dazukommt.', fields: { day: 'Empfindlichkeit Am Tag', night: 'Empfindlichkeit In Der Nacht', delay: 'Verzögerung Für Reserve', dayContact: 'Erster Alarm Am Tag', nightContact: 'Erster Alarm In Der Nacht' }, options: { gentle: 'Sanft', balanced: 'Ausgewogen', watchful: 'Aufmerksam', protective: 'Schützend', urgent: 'Dringend', seconds: 's' } },
  zh: { title: '偏好设置', save: '保存设置', saving: '正在保存', summary: '当前设置', explainer: '这些设置会让白天的支持更轻或更紧，也决定后备支持何时加入。', fields: { day: '白天敏感度', night: '夜间敏感度', delay: '后备延迟', dayContact: '白天第一通知', nightContact: '夜间第一通知' }, options: { gentle: '轻柔', balanced: '平衡', watchful: '更留意', protective: '更保护', urgent: '紧急', seconds: '秒' } },
  ja: { title: '設定', save: '設定を保存', saving: '保存中', summary: '現在の設定', explainer: 'これらの設定で、日中のサポートをやわらかくするか厳しめにするか、そして補助がいつ入るかを決めます。', fields: { day: '昼の感度', night: '夜の感度', delay: '補助までの遅れ', dayContact: '昼の最初の通知先', nightContact: '夜の最初の通知先' }, options: { gentle: 'やさしく', balanced: '標準', watchful: '注意深く', protective: '保護重視', urgent: '緊急', seconds: '秒' } },
  pt: { title: 'Preferências', save: 'Salvar Preferências', saving: 'Salvando', summary: 'Configuração Atual', explainer: 'Estas configurações deixam o apoio do dia mais suave ou mais atento e decidem quando o apoio reserva entra.', fields: { day: 'Sensibilidade De Dia', night: 'Sensibilidade Da Noite', delay: 'Atraso Do Apoio', dayContact: 'Primeiro Alerta De Dia', nightContact: 'Primeiro Alerta Da Noite' }, options: { gentle: 'Suave', balanced: 'Equilibrado', watchful: 'Atento', protective: 'Protetor', urgent: 'Urgente', seconds: 's' } },
  he: { title: 'העדפות', save: 'שמור העדפות', saving: 'שומר', summary: 'הגדרה נוכחית', explainer: 'הגדרות אלה הופכות את התמיכה ביום לרכה יותר או צמודה יותר, ומחליטות מתי הגיבוי נכנס.', fields: { day: 'רגישות ביום', night: 'רגישות בלילה', delay: 'השהיית גיבוי', dayContact: 'ההתראה הראשונה ביום', nightContact: 'ההתראה הראשונה בלילה' }, options: { gentle: 'עדין', balanced: 'מאוזן', watchful: 'קשוב', protective: 'מגן', urgent: 'דחוף', seconds: 'ש׳' } },
  ar: { title: 'التفضيلات', save: 'حفظ التفضيلات', saving: 'جارٍ الحفظ', summary: 'الإعداد الحالي', explainer: 'هذه الإعدادات تجعل الدعم النهاري أخف أو أكثر قربًا، وتحدد متى يدخل الدعم الاحتياطي.', fields: { day: 'حساسية النهار', night: 'حساسية الليل', delay: 'تأخير الدعم الاحتياطي', dayContact: 'أول تنبيه نهارًا', nightContact: 'أول تنبيه ليلًا' }, options: { gentle: 'لطيف', balanced: 'متوازن', watchful: 'أكثر انتباهًا', protective: 'أكثر حماية', urgent: 'عاجل', seconds: 'ث' } },
};

const NOTIFICATION_COPY: Record<Language, {
  title: string;
  summary: string;
  explainer: string;
  activeNow: string;
  dayFlow: string;
  nightFlow: string;
  backup: string;
  enabled: string;
  disabled: string;
  settings: { gentle: string; balanced: string; watchful: string; protective: string; urgent: string };
  descriptions: {
    day: Record<'gentle' | 'balanced' | 'watchful', string>;
    night: Record<'balanced' | 'protective' | 'urgent', string>;
  };
}> = {
  en: { title: 'Alerts', summary: 'How Alerts Run', explainer: 'When something urgent happens, the system starts with one person, repeats if needed, then brings in backup.', activeNow: 'Current Mode', dayFlow: 'Day Flow', nightFlow: 'Night Flow', backup: 'Backup Support', enabled: 'On', disabled: 'Off', settings: { gentle: 'Gentle', balanced: 'Balanced', watchful: 'Watchful', protective: 'Protective', urgent: 'Urgent' }, descriptions: { day: { gentle: 'Daytime check-ins stay light before backup joins.', balanced: 'Daytime checks stay balanced with backup kept close.', watchful: 'Daytime checks stay closer with faster follow-up.' }, night: { balanced: 'Night alerts stay calm and measured.', protective: 'Night alerts stay tighter and more protective.', urgent: 'Night alerts move faster and louder.' } } },
  ru: { title: 'Сигналы', summary: 'Как Работают Сигналы', explainer: 'Когда происходит что-то срочное, система сначала идёт к одному человеку, затем повторяет сигнал и только потом подключает резерв.', activeNow: 'Текущий Режим', dayFlow: 'Дневной Ход', nightFlow: 'Ночной Ход', backup: 'Резервная Поддержка', enabled: 'Включено', disabled: 'Выключено', settings: { gentle: 'Мягко', balanced: 'Сбалансированно', watchful: 'Внимательно', protective: 'Защитно', urgent: 'Срочно' }, descriptions: { day: { gentle: 'Днём сигналы остаются мягкими, прежде чем подключится резерв.', balanced: 'Днём сигналы идут ровно, а резерв остаётся рядом.', watchful: 'Днём проверка плотнее и повтор приходит быстрее.' }, night: { balanced: 'Ночные сигналы остаются спокойными и размеренными.', protective: 'Ночные сигналы становятся строже и защитнее.', urgent: 'Ночные сигналы идут быстрее и заметнее.' } } },
  uk: { title: 'Сигнали', summary: 'Як Працюють Сигнали', explainer: 'Коли стається щось термінове, система спершу звертається до однієї людини, за потреби повторює сигнал і лише потім підключає резерв.', activeNow: 'Поточний Режим', dayFlow: 'Денний Хід', nightFlow: 'Нічний Хід', backup: 'Резервна Підтримка', enabled: 'Увімкнено', disabled: 'Вимкнено', settings: { gentle: 'М’яко', balanced: 'Збалансовано', watchful: 'Уважно', protective: 'Захисно', urgent: 'Терміново' }, descriptions: { day: { gentle: 'Вдень сигнали залишаються м’якими, перш ніж підключиться резерв.', balanced: 'Вдень сигнали йдуть рівно, а резерв залишається поруч.', watchful: 'Вдень перевірка щільніша й повтор приходить швидше.' }, night: { balanced: 'Нічні сигнали залишаються спокійними й рівними.', protective: 'Нічні сигнали стають щільнішими й захиснішими.', urgent: 'Нічні сигнали йдуть швидше та помітніше.' } } },
  es: { title: 'Alertas', summary: 'Cómo Funcionan', explainer: 'Cuando pasa algo urgente, el sistema empieza con una persona, repite si hace falta y luego trae apoyo.', activeNow: 'Modo Actual', dayFlow: 'Flujo De Día', nightFlow: 'Flujo De Noche', backup: 'Apoyo De Respaldo', enabled: 'Sí', disabled: 'No', settings: { gentle: 'Suave', balanced: 'Equilibrado', watchful: 'Atento', protective: 'Protector', urgent: 'Urgente' }, descriptions: { day: { gentle: 'De día los avisos siguen siendo suaves antes de llamar al apoyo.', balanced: 'De día los avisos se mantienen equilibrados con el apoyo cerca.', watchful: 'De día el seguimiento es más cercano y el recordatorio llega antes.' }, night: { balanced: 'Por la noche los avisos siguen tranquilos y medidos.', protective: 'Por la noche los avisos son más firmes y protectores.', urgent: 'Por la noche los avisos van más rápido y más fuertes.' } } },
  fr: { title: 'Alertes', summary: 'Comment Elles Fonctionnent', explainer: 'Quand quelque chose d’urgent arrive, le système commence par une personne, répète si besoin, puis fait entrer le relais.', activeNow: 'Mode Actuel', dayFlow: 'Flux De Jour', nightFlow: 'Flux De Nuit', backup: 'Soutien De Relais', enabled: 'Oui', disabled: 'Non', settings: { gentle: 'Doux', balanced: 'Équilibré', watchful: 'Attentif', protective: 'Protecteur', urgent: 'Urgent' }, descriptions: { day: { gentle: 'Le jour, les rappels restent légers avant que le relais n’entre.', balanced: 'Le jour, les rappels restent équilibrés avec le relais à proximité.', watchful: 'Le jour, le suivi est plus serré et le rappel revient plus vite.' }, night: { balanced: 'La nuit, les alertes restent calmes et mesurées.', protective: 'La nuit, les alertes deviennent plus serrées et protectrices.', urgent: 'La nuit, les alertes vont plus vite et plus fort.' } } },
  de: { title: 'Alarme', summary: 'So Laufen Sie', explainer: 'Wenn etwas Dringendes passiert, geht das System zuerst zu einer Person, wiederholt bei Bedarf und holt dann die Reserve dazu.', activeNow: 'Aktueller Modus', dayFlow: 'Tagesablauf', nightFlow: 'Nachtablauf', backup: 'Reserve', enabled: 'An', disabled: 'Aus', settings: { gentle: 'Sanft', balanced: 'Ausgewogen', watchful: 'Aufmerksam', protective: 'Schützend', urgent: 'Dringend' }, descriptions: { day: { gentle: 'Am Tag bleiben Hinweise leicht, bevor die Reserve dazukommt.', balanced: 'Am Tag bleiben Hinweise ausgewogen, die Reserve bleibt in Reichweite.', watchful: 'Am Tag ist die Nachverfolgung enger und kommt schneller wieder.' }, night: { balanced: 'Nachts bleiben Alarme ruhig und kontrolliert.', protective: 'Nachts werden Alarme enger und schützender.', urgent: 'Nachts werden Alarme schneller und deutlicher.' } } },
  zh: { title: '提醒', summary: '提醒如何运行', explainer: '当出现紧急情况时，系统会先联系一个人，必要时重复，然后再拉入后备支持。', activeNow: '当前模式', dayFlow: '白天流程', nightFlow: '夜间流程', backup: '后备支持', enabled: '开', disabled: '关', settings: { gentle: '轻柔', balanced: '平衡', watchful: '更留意', protective: '更保护', urgent: '紧急' }, descriptions: { day: { gentle: '白天会先保持较轻的提醒，再决定是否拉入后备。', balanced: '白天提醒保持平衡，同时让后备随时可加入。', watchful: '白天跟进会更紧，重复提醒也会更快。' }, night: { balanced: '夜间提醒保持平稳和克制。', protective: '夜间提醒会更紧一些，也更保护。', urgent: '夜间提醒会更快、更强。' } } },
  ja: { title: 'アラート', summary: '通知の流れ', explainer: '何か緊急なことが起きたとき、システムはまず一人に知らせ、必要なら繰り返し、その後で補助を呼びます。', activeNow: '現在のモード', dayFlow: '昼の流れ', nightFlow: '夜の流れ', backup: '補助サポート', enabled: 'オン', disabled: 'オフ', settings: { gentle: 'やさしく', balanced: '標準', watchful: '注意深く', protective: '保護重視', urgent: '緊急' }, descriptions: { day: { gentle: '昼は補助が入る前に、通知をやわらかく保ちます。', balanced: '昼は通知を標準に保ち、補助も近くに置きます。', watchful: '昼は追跡がやや密になり、再通知も早くなります。' }, night: { balanced: '夜の通知は落ち着いていて穏やかです。', protective: '夜の通知はより密で、守る動きになります。', urgent: '夜の通知はより速く、より強く届きます。' } } },
  pt: { title: 'Alertas', summary: 'Como Funcionam', explainer: 'Quando algo urgente acontece, o sistema começa com uma pessoa, repete se precisar e depois chama o apoio reserva.', activeNow: 'Modo Atual', dayFlow: 'Fluxo Do Dia', nightFlow: 'Fluxo Da Noite', backup: 'Apoio Reserva', enabled: 'Ligado', disabled: 'Desligado', settings: { gentle: 'Suave', balanced: 'Equilibrado', watchful: 'Atento', protective: 'Protetor', urgent: 'Urgente' }, descriptions: { day: { gentle: 'Durante o dia os avisos ficam leves antes do apoio entrar.', balanced: 'Durante o dia os avisos ficam equilibrados com o apoio por perto.', watchful: 'Durante o dia o acompanhamento fica mais próximo e volta mais rápido.' }, night: { balanced: 'À noite os alertas ficam calmos e medidos.', protective: 'À noite os alertas ficam mais firmes e protetores.', urgent: 'À noite os alertas ficam mais rápidos e fortes.' } } },
  he: { title: 'התראות', summary: 'איך הן פועלות', explainer: 'כשמשהו דחוף קורה, המערכת מתחילה עם אדם אחד, חוזרת אם צריך, ואז מכניסה גיבוי.', activeNow: 'המצב הנוכחי', dayFlow: 'זרימה ביום', nightFlow: 'זרימה בלילה', backup: 'תמיכת גיבוי', enabled: 'פועל', disabled: 'כבוי', settings: { gentle: 'עדין', balanced: 'מאוזן', watchful: 'קשוב', protective: 'מגן', urgent: 'דחוף' }, descriptions: { day: { gentle: 'ביום הבדיקות נשארות קלות לפני שהגיבוי נכנס.', balanced: 'ביום הבדיקות נשארות מאוזנות כשהגיבוי קרוב.', watchful: 'ביום המעקב צמוד יותר והמשך מגיע מהר יותר.' }, night: { balanced: 'בלילה ההתראות נשארות רגועות ומדודות.', protective: 'בלילה ההתראות צמודות יותר ומגינות יותר.', urgent: 'בלילה ההתראות מהירות וחזקות יותר.' } } },
  ar: { title: 'التنبيهات', summary: 'كيف تعمل', explainer: 'عندما يحدث شيء عاجل، يبدأ النظام بشخص واحد، ويكرر عند الحاجة، ثم يدخل الدعم الاحتياطي.', activeNow: 'الوضع الحالي', dayFlow: 'مسار النهار', nightFlow: 'مسار الليل', backup: 'الدعم الاحتياطي', enabled: 'مفعّل', disabled: 'متوقف', settings: { gentle: 'لطيف', balanced: 'متوازن', watchful: 'أكثر انتباهًا', protective: 'أكثر حماية', urgent: 'عاجل' }, descriptions: { day: { gentle: 'نهارًا تبقى المتابعات خفيفة قبل أن يدخل الدعم الاحتياطي.', balanced: 'نهارًا تبقى المتابعات متوازنة مع بقاء الدعم الاحتياطي قريبًا.', watchful: 'نهارًا تصبح المتابعة أقرب ويعود التنبيه بشكل أسرع.' }, night: { balanced: 'ليلًا تبقى التنبيهات هادئة ومدروسة.', protective: 'ليلًا تصبح التنبيهات أقرب وأكثر حماية.', urgent: 'ليلًا تصبح التنبيهات أسرع وأقوى.' } } },
};

const DELIVERY_COPY: Record<Language, {
  feed: string;
  channel: string;
  attempts: string;
  target: string;
  push: string;
  quiet: string;
  delivered: string;
  retrying: string;
  escalated: string;
  sent: string;
  resolved: string;
}> = {
  en: { feed: 'Alert Log', channel: 'Channel', attempts: 'Attempts', target: 'Sent To', push: 'Push', quiet: 'Quiet', delivered: 'Delivered', retrying: 'Retrying', escalated: 'Escalated', sent: 'Sent', resolved: 'Resolved' },
  ru: { feed: 'Журнал Сигналов', channel: 'Канал', attempts: 'Попытки', target: 'Кому Ушло', push: 'Push', quiet: 'Тихо', delivered: 'Доставлено', retrying: 'Повтор', escalated: 'Эскалация', sent: 'Отправлено', resolved: 'Закрыто' },
  uk: { feed: 'Журнал Сигналів', channel: 'Канал', attempts: 'Спроби', target: 'Кому Пішло', push: 'Push', quiet: 'Тихо', delivered: 'Доставлено', retrying: 'Повтор', escalated: 'Ескалація', sent: 'Надіслано', resolved: 'Закрито' },
  es: { feed: 'Registro De Alertas', channel: 'Canal', attempts: 'Intentos', target: 'Enviado A', push: 'Push', quiet: 'Silencio', delivered: 'Entregado', retrying: 'Reintentando', escalated: 'Escalado', sent: 'Enviado', resolved: 'Resuelto' },
  fr: { feed: 'Journal Des Alertes', channel: 'Canal', attempts: 'Essais', target: 'Envoyé À', push: 'Push', quiet: 'Calme', delivered: 'Livré', retrying: 'Nouvelle Tentative', escalated: 'Escaladé', sent: 'Envoyé', resolved: 'Résolu' },
  de: { feed: 'Alarmprotokoll', channel: 'Kanal', attempts: 'Versuche', target: 'Gesendet An', push: 'Push', quiet: 'Ruhig', delivered: 'Zugestellt', retrying: 'Erneut', escalated: 'Eskaliert', sent: 'Gesendet', resolved: 'Gelöst' },
  zh: { feed: '提醒日志', channel: '渠道', attempts: '尝试次数', target: '发送给', push: '推送', quiet: '安静', delivered: '已送达', retrying: '重试中', escalated: '已升级', sent: '已发送', resolved: '已解决' },
  ja: { feed: 'アラート記録', channel: '方法', attempts: '試行回数', target: '送信先', push: 'プッシュ', quiet: '静か', delivered: '配信済み', retrying: '再試行中', escalated: 'エスカレーション', sent: '送信済み', resolved: '解決済み' },
  pt: { feed: 'Registro De Alertas', channel: 'Canal', attempts: 'Tentativas', target: 'Enviado Para', push: 'Push', quiet: 'Calmo', delivered: 'Entregue', retrying: 'Tentando De Novo', escalated: 'Escalado', sent: 'Enviado', resolved: 'Resolvido' },
  he: { feed: 'יומן התראות', channel: 'ערוץ', attempts: 'ניסיונות', target: 'נשלח אל', push: 'פוש', quiet: 'שקט', delivered: 'נמסר', retrying: 'מנסה שוב', escalated: 'הוסלם', sent: 'נשלח', resolved: 'נפתר' },
  ar: { feed: 'سجل التنبيهات', channel: 'القناة', attempts: 'المحاولات', target: 'أُرسل إلى', push: 'دفع', quiet: 'هادئ', delivered: 'تم التسليم', retrying: 'إعادة المحاولة', escalated: 'تم التصعيد', sent: 'تم الإرسال', resolved: 'تم الحل' },
};

const HOUSEHOLD_COPY: Record<Language, {
  invite: string;
  members: string;
  active: string;
  invited: string;
}> = {
  en: { invite: 'Invite Code', members: 'People', active: 'Joined', invited: 'Invited' },
  ru: { invite: 'Код Приглашения', members: 'Люди', active: 'Подключены', invited: 'Приглашены' },
  uk: { invite: 'Код Запрошення', members: 'Люди', active: 'Підключені', invited: 'Запрошені' },
  es: { invite: 'Código De Invitación', members: 'Personas', active: 'Se Unió', invited: 'Invitado' },
  fr: { invite: 'Code D’Invitation', members: 'Personnes', active: 'A Rejoint', invited: 'Invité' },
  de: { invite: 'Einladungscode', members: 'Personen', active: 'Dabei', invited: 'Eingeladen' },
  zh: { invite: '邀请码', members: '成员', active: '已加入', invited: '已邀请' },
  ja: { invite: '招待コード', members: '参加者', active: '参加済み', invited: '招待中' },
  pt: { invite: 'Código De Convite', members: 'Pessoas', active: 'Entrou', invited: 'Convidado' },
  he: { invite: 'קוד הזמנה', members: 'אנשים', active: 'הצטרף', invited: 'הוזמן' },
  ar: { invite: 'رمز الدعوة', members: 'الأشخاص', active: 'انضم', invited: 'تمت دعوته' },
};

const REVIEW_COPY: Record<Language, {
  title: string;
  score: string;
  delivery: string;
  response: string;
  pattern: string;
  notes: string;
  nextFocus: string;
  strong: string;
  watch: string;
  fragile: string;
  steady: string;
  repeatRisk: string;
  escalationHeavy: string;
}> = {
  en: { title: 'Review', score: 'Stability', delivery: 'Delivery', response: 'Response', pattern: 'Pattern', notes: 'Notes', nextFocus: 'Next Step', strong: 'Strong', watch: 'Watch', fragile: 'Fragile', steady: 'Steady', repeatRisk: 'Risk Of Repeat', escalationHeavy: 'Heavy Escalation' },
  ru: { title: 'Разбор', score: 'Стабильность', delivery: 'Доставка', response: 'Реакция', pattern: 'Паттерн', notes: 'Заметки', nextFocus: 'Следующий Шаг', strong: 'Сильно', watch: 'Наблюдать', fragile: 'Хрупко', steady: 'Ровно', repeatRisk: 'Риск Повтора', escalationHeavy: 'Тяжёлая Эскалация' },
  uk: { title: 'Огляд', score: 'Стабільність', delivery: 'Доставка', response: 'Реакція', pattern: 'Патерн', notes: 'Нотатки', nextFocus: 'Наступний Крок', strong: 'Сильно', watch: 'Нагляд', fragile: 'Крихко', steady: 'Рівно', repeatRisk: 'Ризик Повтору', escalationHeavy: 'Важка Ескалація' },
  es: { title: 'Revisión', score: 'Estabilidad', delivery: 'Entrega', response: 'Respuesta', pattern: 'Patrón', notes: 'Notas', nextFocus: 'Siguiente Paso', strong: 'Fuerte', watch: 'Vigilar', fragile: 'Frágil', steady: 'Estable', repeatRisk: 'Riesgo De Repetición', escalationHeavy: 'Escalada Alta' },
  fr: { title: 'Revue', score: 'Stabilité', delivery: 'Livraison', response: 'Réponse', pattern: 'Schéma', notes: 'Notes', nextFocus: 'Étape Suivante', strong: 'Fort', watch: 'Surveillance', fragile: 'Fragile', steady: 'Stable', repeatRisk: 'Risque De Retour', escalationHeavy: 'Escalade Lourde' },
  de: { title: 'Rückblick', score: 'Stabilität', delivery: 'Zustellung', response: 'Reaktion', pattern: 'Muster', notes: 'Notizen', nextFocus: 'Nächster Schritt', strong: 'Stark', watch: 'Beobachten', fragile: 'Fragil', steady: 'Stetig', repeatRisk: 'Risiko Einer Wiederholung', escalationHeavy: 'Starke Eskalation' },
  zh: { title: '回顾', score: '稳定度', delivery: '送达', response: '响应', pattern: '模式', notes: '备注', nextFocus: '下一步', strong: '强', watch: '留意', fragile: '脆弱', steady: '平稳', repeatRisk: '重复风险', escalationHeavy: '升级较多' },
  ja: { title: 'レビュー', score: '安定性', delivery: '配信', response: '対応', pattern: '傾向', notes: 'メモ', nextFocus: '次の一歩', strong: '強い', watch: '見守り', fragile: '不安定', steady: '安定', repeatRisk: '再発リスク', escalationHeavy: 'エスカレーション多め' },
  pt: { title: 'Revisão', score: 'Estabilidade', delivery: 'Entrega', response: 'Resposta', pattern: 'Padrão', notes: 'Notas', nextFocus: 'Próximo Passo', strong: 'Forte', watch: 'Atenção', fragile: 'Frágil', steady: 'Estável', repeatRisk: 'Risco De Repetição', escalationHeavy: 'Escalada Alta' },
  he: { title: 'סקירה', score: 'יציבות', delivery: 'מסירה', response: 'תגובה', pattern: 'דפוס', notes: 'הערות', nextFocus: 'השלב הבא', strong: 'חזק', watch: 'מעקב', fragile: 'שביר', steady: 'יציב', repeatRisk: 'סיכון לחזרה', escalationHeavy: 'הסלמה כבדה' },
  ar: { title: 'مراجعة', score: 'الاستقرار', delivery: 'التسليم', response: 'الاستجابة', pattern: 'النمط', notes: 'ملاحظات', nextFocus: 'الخطوة التالية', strong: 'قوي', watch: 'مراقبة', fragile: 'هش', steady: 'مستقر', repeatRisk: 'خطر التكرار', escalationHeavy: 'تصعيد مرتفع' },
};

const DEXCOM_OPS_COPY: Record<Language, {
  health: string;
  scheduler: string;
  audit: string;
  nextStep: string;
  lastSuccess: string;
  lastFailure: string;
  failures: string;
  nextRun: string;
  lastRun: string;
  pausedUntil: string;
  healthy: string;
  watch: string;
  broken: string;
  idle: string;
  scheduled: string;
  paused: string;
  running: string;
  ok: string;
  warning: string;
  error: string;
}> = {
  en: { health: 'Dexcom Status', scheduler: 'Sync Schedule', audit: 'Dexcom Log', nextStep: 'Next Step', lastSuccess: 'Last Good Sync', lastFailure: 'Last Problem', failures: 'Repeated Problems', nextRun: 'Next Run', lastRun: 'Last Run', pausedUntil: 'Paused Until', healthy: 'Healthy', watch: 'Watch', broken: 'Needs Fix', idle: 'Idle', scheduled: 'Scheduled', paused: 'Paused', running: 'Running', ok: 'OK', warning: 'Warning', error: 'Error' },
  ru: { health: 'Статус Dexcom', scheduler: 'Расписание Синхронизации', audit: 'Журнал Dexcom', nextStep: 'Следующий Шаг', lastSuccess: 'Последняя Удачная Синхронизация', lastFailure: 'Последняя Проблема', failures: 'Повторяющиеся Сбои', nextRun: 'Следующий Запуск', lastRun: 'Последний Запуск', pausedUntil: 'Пауза До', healthy: 'Норма', watch: 'Наблюдение', broken: 'Нужно Исправить', idle: 'Ожидание', scheduled: 'Запланировано', paused: 'На Паузе', running: 'В Работе', ok: 'ОК', warning: 'Предупреждение', error: 'Ошибка' },
  uk: { health: 'Статус Dexcom', scheduler: 'Розклад Синхронізації', audit: 'Журнал Dexcom', nextStep: 'Наступний Крок', lastSuccess: 'Остання Вдала Синхронізація', lastFailure: 'Остання Проблема', failures: 'Повторні Збої', nextRun: 'Наступний Запуск', lastRun: 'Останній Запуск', pausedUntil: 'Пауза До', healthy: 'Добре', watch: 'Нагляд', broken: 'Потрібно Виправити', idle: 'Очікування', scheduled: 'Заплановано', paused: 'На Паузі', running: 'Працює', ok: 'ОК', warning: 'Попередження', error: 'Помилка' },
  es: { health: 'Estado Dexcom', scheduler: 'Programa De Sincronización', audit: 'Registro Dexcom', nextStep: 'Siguiente Paso', lastSuccess: 'Última Buena Sincronización', lastFailure: 'Último Problema', failures: 'Problemas Repetidos', nextRun: 'Siguiente Ejecución', lastRun: 'Última Ejecución', pausedUntil: 'En Pausa Hasta', healthy: 'Bien', watch: 'Vigilar', broken: 'Necesita Ajuste', idle: 'En Espera', scheduled: 'Programado', paused: 'En Pausa', running: 'En Curso', ok: 'OK', warning: 'Aviso', error: 'Error' },
  fr: { health: 'Statut Dexcom', scheduler: 'Programme De Synchronisation', audit: 'Journal Dexcom', nextStep: 'Étape Suivante', lastSuccess: 'Dernière Bonne Synchronisation', lastFailure: 'Dernier Problème', failures: 'Problèmes Répétés', nextRun: 'Prochain Lancement', lastRun: 'Dernier Lancement', pausedUntil: 'En Pause Jusqu’à', healthy: 'Bon', watch: 'Surveillance', broken: 'À Corriger', idle: 'En Attente', scheduled: 'Planifié', paused: 'En Pause', running: 'En Cours', ok: 'OK', warning: 'Alerte', error: 'Erreur' },
  de: { health: 'Dexcom-Status', scheduler: 'Sync-Plan', audit: 'Dexcom-Protokoll', nextStep: 'Nächster Schritt', lastSuccess: 'Letzte Gute Synchronisierung', lastFailure: 'Letztes Problem', failures: 'Wiederholte Probleme', nextRun: 'Nächster Lauf', lastRun: 'Letzter Lauf', pausedUntil: 'Pausiert Bis', healthy: 'Gut', watch: 'Beobachten', broken: 'Muss Behoben Werden', idle: 'Leerlauf', scheduled: 'Geplant', paused: 'Pausiert', running: 'Läuft', ok: 'OK', warning: 'Warnung', error: 'Fehler' },
  zh: { health: 'Dexcom 状态', scheduler: '同步计划', audit: 'Dexcom 日志', nextStep: '下一步', lastSuccess: '最近一次正常同步', lastFailure: '最近一次问题', failures: '重复问题', nextRun: '下次运行', lastRun: '上次运行', pausedUntil: '暂停至', healthy: '正常', watch: '留意', broken: '需要处理', idle: '空闲', scheduled: '已计划', paused: '已暂停', running: '运行中', ok: '正常', warning: '警告', error: '错误' },
  ja: { health: 'Dexcom 状態', scheduler: '同期スケジュール', audit: 'Dexcom ログ', nextStep: '次の一歩', lastSuccess: '直近の正常同期', lastFailure: '直近の問題', failures: '繰り返しの問題', nextRun: '次回実行', lastRun: '前回実行', pausedUntil: '一時停止は', healthy: '良好', watch: '見守り', broken: '修正が必要', idle: '待機中', scheduled: '予定済み', paused: '一時停止中', running: '実行中', ok: 'OK', warning: '注意', error: 'エラー' },
  pt: { health: 'Status Dexcom', scheduler: 'Agenda De Sincronização', audit: 'Log Dexcom', nextStep: 'Próximo Passo', lastSuccess: 'Última Boa Sincronização', lastFailure: 'Último Problema', failures: 'Problemas Repetidos', nextRun: 'Próxima Execução', lastRun: 'Última Execução', pausedUntil: 'Pausado Até', healthy: 'Bem', watch: 'Atenção', broken: 'Precisa Ajuste', idle: 'Em Espera', scheduled: 'Agendado', paused: 'Pausado', running: 'Em Execução', ok: 'OK', warning: 'Aviso', error: 'Erro' },
  he: { health: 'סטטוס Dexcom', scheduler: 'לוח סנכרון', audit: 'יומן Dexcom', nextStep: 'השלב הבא', lastSuccess: 'הסנכרון התקין האחרון', lastFailure: 'הבעיה האחרונה', failures: 'בעיות חוזרות', nextRun: 'הרצה הבאה', lastRun: 'הרצה אחרונה', pausedUntil: 'מושהה עד', healthy: 'תקין', watch: 'מעקב', broken: 'דורש תיקון', idle: 'בהמתנה', scheduled: 'מתוזמן', paused: 'מושהה', running: 'פועל', ok: 'OK', warning: 'אזהרה', error: 'שגיאה' },
  ar: { health: 'حالة Dexcom', scheduler: 'جدول المزامنة', audit: 'سجل Dexcom', nextStep: 'الخطوة التالية', lastSuccess: 'آخر مزامنة جيدة', lastFailure: 'آخر مشكلة', failures: 'مشكلات متكررة', nextRun: 'التشغيل التالي', lastRun: 'آخر تشغيل', pausedUntil: 'متوقف حتى', healthy: 'جيد', watch: 'مراقبة', broken: 'يحتاج إصلاحًا', idle: 'انتظار', scheduled: 'مجدول', paused: 'متوقف', running: 'قيد التشغيل', ok: 'موافق', warning: 'تنبيه', error: 'خطأ' },
};

const GUIDANCE_COPY: Record<Language, {
  title: string;
  now: string;
  watch: string;
  fallback: string;
  checklist: string;
}> = {
  en: { title: 'Guidance', now: 'Now', watch: 'Keep Watching', fallback: 'If Data Gets Weak', checklist: 'Checklist' },
  ru: { title: 'Подсказки', now: 'Сейчас', watch: 'Что Держать В Поле Зрения', fallback: 'Если Данные Станут Слабее', checklist: 'Короткий Список' },
  uk: { title: 'Підказки', now: 'Зараз', watch: 'Що Тримати В Полі Зору', fallback: 'Якщо Дані Ослабнуть', checklist: 'Короткий Список' },
  es: { title: 'Guía', now: 'Ahora', watch: 'Qué Seguir Mirando', fallback: 'Si Los Datos Se Debilitan', checklist: 'Lista Corta' },
  fr: { title: 'Repères', now: 'Maintenant', watch: 'À Garder En Vue', fallback: 'Si Les Données Faiblissent', checklist: 'Liste Courte' },
  de: { title: 'Hinweise', now: 'Jetzt', watch: 'Im Blick Behalten', fallback: 'Wenn Die Daten Schwächer Werden', checklist: 'Kurze Liste' },
  zh: { title: '提示', now: '现在', watch: '继续留意', fallback: '如果数据变弱', checklist: '简要清单' },
  ja: { title: 'ガイダンス', now: 'いま', watch: '見続けること', fallback: 'データが弱くなったら', checklist: 'チェック項目' },
  pt: { title: 'Orientação', now: 'Agora', watch: 'Fique De Olho', fallback: 'Se Os Dados Ficarem Fracos', checklist: 'Lista Curta' },
  he: { title: 'הכוונה', now: 'עכשיו', watch: 'מה להמשיך לעקוב אחריו', fallback: 'אם הנתונים נחלשים', checklist: 'רשימה קצרה' },
  ar: { title: 'إرشاد', now: 'الآن', watch: 'ما الذي تتابعه', fallback: 'إذا ضعفت البيانات', checklist: 'قائمة قصيرة' },
};

const READINESS_COPY: Record<Language, {
  title: string;
  connection: string;
  backup: string;
  responder: string;
  recovery: string;
  ready: string;
  watch: string;
  needsAttention: string;
}> = {
  en: { title: 'Family Readiness', connection: 'Connection', backup: 'Backup', responder: 'Responder', recovery: 'Recovery', ready: 'Ready', watch: 'Watch', needsAttention: 'Needs Care' },
  ru: { title: 'Готовность Семьи', connection: 'Связь', backup: 'Резерв', responder: 'Кто Отвечает', recovery: 'Восстановление', ready: 'Готово', watch: 'Наблюдение', needsAttention: 'Нужно Внимание' },
  uk: { title: 'Готовність Сім’ї', connection: 'Зв’язок', backup: 'Резерв', responder: 'Хто Відповідає', recovery: 'Відновлення', ready: 'Готово', watch: 'Нагляд', needsAttention: 'Потрібна Увага' },
  es: { title: 'Preparación Familiar', connection: 'Conexión', backup: 'Respaldo', responder: 'Responsable', recovery: 'Recuperación', ready: 'Listo', watch: 'Vigilar', needsAttention: 'Necesita Atención' },
  fr: { title: 'Préparation De La Famille', connection: 'Connexion', backup: 'Relais', responder: 'Répondant', recovery: 'Récupération', ready: 'Prêt', watch: 'Surveillance', needsAttention: 'Demande Attention' },
  de: { title: 'Familienbereitschaft', connection: 'Verbindung', backup: 'Reserve', responder: 'Verantwortlich', recovery: 'Erholung', ready: 'Bereit', watch: 'Beobachten', needsAttention: 'Braucht Aufmerksamkeit' },
  zh: { title: '家庭准备状态', connection: '连接', backup: '后备支持', responder: '当前响应人', recovery: '恢复', ready: '已准备好', watch: '留意', needsAttention: '需要关注' },
  ja: { title: '家族の準備状況', connection: '接続', backup: '予備対応', responder: '対応者', recovery: '回復', ready: '準備完了', watch: '見守り', needsAttention: '注意が必要' },
  pt: { title: 'Prontidão Da Família', connection: 'Conexão', backup: 'Apoio Reserva', responder: 'Responsável', recovery: 'Recuperação', ready: 'Pronto', watch: 'Atenção', needsAttention: 'Precisa Atenção' },
  he: { title: 'מוכנות המשפחה', connection: 'חיבור', backup: 'גיבוי', responder: 'מי מגיב', recovery: 'התאוששות', ready: 'מוכן', watch: 'מעקב', needsAttention: 'צריך תשומת לב' },
  ar: { title: 'جاهزية العائلة', connection: 'الاتصال', backup: 'الدعم الاحتياطي', responder: 'المستجيب', recovery: 'التعافي', ready: 'جاهز', watch: 'مراقبة', needsAttention: 'يحتاج انتباهًا' },
};

const SUMMARY_COPY: Record<Language, {
  title: string;
  calm: string;
  watch: string;
  attention: string;
}> = {
  en: { title: 'Quick Read', calm: 'Calm', watch: 'Watch', attention: 'Attention' },
  ru: { title: 'Быстрый Смысл', calm: 'Спокойно', watch: 'Наблюдать', attention: 'Внимание' },
  uk: { title: 'Швидкий Зміст', calm: 'Спокійно', watch: 'Нагляд', attention: 'Увага' },
  es: { title: 'Lectura Rápida', calm: 'Calma', watch: 'Vigilar', attention: 'Atención' },
  fr: { title: 'Lecture Rapide', calm: 'Calme', watch: 'Surveillance', attention: 'Attention' },
  de: { title: 'Kurzüberblick', calm: 'Ruhig', watch: 'Beobachten', attention: 'Achtung' },
  zh: { title: '快速查看', calm: '平稳', watch: '留意', attention: '注意' },
  ja: { title: 'クイック表示', calm: '落ち着いている', watch: '見守り', attention: '注意' },
  pt: { title: 'Leitura Rápida', calm: 'Calmo', watch: 'Atenção', attention: 'Atenção Imediata' },
  he: { title: 'מבט מהיר', calm: 'רגוע', watch: 'מעקב', attention: 'תשומת לב' },
  ar: { title: 'قراءة سريعة', calm: 'هادئ', watch: 'مراقبة', attention: 'انتباه' },
};

const LAYOUT_COPY: Record<Language, {
  system: string;
  support: string;
  guidance: string;
  settings: string;
  review: string;
  logs: string;
}> = {
  en: { system: 'System', support: 'Support', guidance: 'Guidance', settings: 'Settings', review: 'Review', logs: 'Logs' },
  ru: { system: 'Система', support: 'Поддержка', guidance: 'Подсказки', settings: 'Настройки', review: 'Разбор', logs: 'Журналы' },
  uk: { system: 'Система', support: 'Підтримка', guidance: 'Підказки', settings: 'Налаштування', review: 'Огляд', logs: 'Журнали' },
  es: { system: 'Sistema', support: 'Apoyo', guidance: 'Guía', settings: 'Ajustes', review: 'Revisión', logs: 'Registros' },
  fr: { system: 'Système', support: 'Soutien', guidance: 'Repères', settings: 'Réglages', review: 'Revue', logs: 'Journaux' },
  de: { system: 'System', support: 'Unterstützung', guidance: 'Hinweise', settings: 'Einstellungen', review: 'Rückblick', logs: 'Protokolle' },
  zh: { system: '系统', support: '支持', guidance: '提示', settings: '设置', review: '回顾', logs: '日志' },
  ja: { system: 'システム', support: 'サポート', guidance: 'ガイダンス', settings: '設定', review: 'レビュー', logs: 'ログ' },
  pt: { system: 'Sistema', support: 'Apoio', guidance: 'Orientação', settings: 'Preferências', review: 'Revisão', logs: 'Registros' },
  he: { system: 'מערכת', support: 'תמיכה', guidance: 'הכוונה', settings: 'הגדרות', review: 'סקירה', logs: 'יומנים' },
  ar: { system: 'النظام', support: 'الدعم', guidance: 'الإرشاد', settings: 'الإعدادات', review: 'المراجعة', logs: 'السجلات' },
};

const DEXCOM_COPY: Record<Language, {
  title: string;
  connect: string;
  disconnect: string;
  refresh: string;
  provider: string;
  account: string;
  status: string;
  freshness: string;
  lastPoll: string;
  token: string;
  message: string;
  mode: string;
  config: string;
  oauth: string;
  mock: string;
  ready: string;
  missing: string;
  missingFields: string;
  authorize: string;
  callbackCode: string;
  callbackPlaceholder: string;
  finishOauth: string;
  tokenStatus: string;
  tokenIssued: string;
  tokenRefresh: string;
  accessPreview: string;
  refreshPreview: string;
  refreshToken: string;
  hasRefresh: string;
  autoRefresh: string;
  nextPoll: string;
  refreshedNow: string;
  noRefreshNeeded: string;
  refreshFailed: string;
  idleState: string;
  active: string;
  expiringSoon: string;
  expired: string;
  missingToken: string;
  disconnected: string;
  connected: string;
  error: string;
  live: string;
  delayed: string;
  stale: string;
  offline: string;
}> = {
  en: { title: 'Dexcom Connection', connect: 'Connect Dexcom', disconnect: 'Disconnect Dexcom', refresh: 'Refresh Data', provider: 'Provider', account: 'Account', status: 'Connection', freshness: 'Freshness', lastPoll: 'Last Poll', token: 'Token Window', message: 'Connection Message', mode: 'Mode', config: 'Config', oauth: 'OAuth Ready', mock: 'Mock Mode', ready: 'Ready', missing: 'Missing', missingFields: 'Missing Config', authorize: 'Start OAuth', callbackCode: 'Auth Code', callbackPlaceholder: 'Paste authorization code', finishOauth: 'Finish OAuth', tokenStatus: 'Token Status', tokenIssued: 'Token Issued', tokenRefresh: 'Last Token Refresh', accessPreview: 'Access Token', refreshPreview: 'Refresh Token', hasRefresh: 'Refresh Available', refreshToken: 'Refresh Token Now', autoRefresh: 'Auto Refresh', nextPoll: 'Next Poll', refreshedNow: 'Refreshed Now', noRefreshNeeded: 'No Refresh Needed', refreshFailed: 'Refresh Failed', idleState: 'Idle', active: 'Active', expiringSoon: 'Expiring Soon', expired: 'Expired', missingToken: 'Missing', disconnected: 'Disconnected', connected: 'Connected', error: 'Needs Attention', live: 'Live', delayed: 'Delayed', stale: 'Stale', offline: 'Offline' },
  ru: { title: 'Подключение Dexcom', connect: 'Подключить Dexcom', disconnect: 'Отключить Dexcom', refresh: 'Обновить Данные', provider: 'Провайдер', account: 'Аккаунт', status: 'Подключение', freshness: 'Свежесть', lastPoll: 'Последний Poll', token: 'Окно Токена', message: 'Сообщение Подключения', mode: 'Режим', config: 'Конфиг', oauth: 'OAuth Готов', mock: 'Mock Режим', ready: 'Готово', missing: 'Не Хватает', missingFields: 'Чего Не Хватает', authorize: 'Запустить OAuth', callbackCode: 'Код Авторизации', callbackPlaceholder: 'Вставьте код авторизации', finishOauth: 'Завершить OAuth', tokenStatus: 'Статус Токена', tokenIssued: 'Токен Выдан', tokenRefresh: 'Последнее Обновление Токена', accessPreview: 'Access Токен', refreshPreview: 'Refresh Токен', hasRefresh: 'Refresh Доступен', refreshToken: 'Обновить Токен', autoRefresh: 'Автообновление', nextPoll: 'Следующий Poll', refreshedNow: 'Только Что Обновлён', noRefreshNeeded: 'Обновление Не Нужно', refreshFailed: 'Автообновление Не Удалось', idleState: 'Ожидание', active: 'Активен', expiringSoon: 'Скоро Истечёт', expired: 'Истёк', missingToken: 'Отсутствует', disconnected: 'Не Подключён', connected: 'Подключён', error: 'Нужно Внимание', live: 'Свежие', delayed: 'С Задержкой', stale: 'Устарели', offline: 'Оффлайн' },
  uk: { title: 'Підключення Dexcom', connect: 'Підключити Dexcom', disconnect: 'Відключити Dexcom', refresh: 'Оновити Дані', provider: 'Провайдер', account: 'Акаунт', status: 'Підключення', freshness: 'Свіжість', lastPoll: 'Останній Poll', token: 'Вікно Токена', message: 'Повідомлення Підключення', mode: 'Режим', config: 'Конфіг', oauth: 'OAuth Готовий', mock: 'Mock Режим', ready: 'Готово', missing: 'Не Вистачає', missingFields: 'Чого Бракує', authorize: 'Запустити OAuth', callbackCode: 'Код Авторизації', callbackPlaceholder: 'Вставте код авторизації', finishOauth: 'Завершити OAuth', tokenStatus: 'Статус Токена', tokenIssued: 'Токен Видано', tokenRefresh: 'Останнє Оновлення Токена', accessPreview: 'Access Токен', refreshPreview: 'Refresh Токен', hasRefresh: 'Refresh Доступний', refreshToken: 'Оновити Токен', autoRefresh: 'Автооновлення', nextPoll: 'Наступний Poll', refreshedNow: 'Щойно Оновлено', noRefreshNeeded: 'Оновлення Не Потрібне', refreshFailed: 'Автооновлення Не Вдалося', idleState: 'Очікування', active: 'Активний', expiringSoon: 'Скоро Спливе', expired: 'Сплив', missingToken: 'Відсутній', disconnected: 'Не Підключено', connected: 'Підключено', error: 'Потрібна Увага', live: 'Свіжі', delayed: 'Із Затримкою', stale: 'Застарілі', offline: 'Оффлайн' },
  es: { title: 'Conexión Dexcom', connect: 'Conectar Dexcom', disconnect: 'Desconectar Dexcom', refresh: 'Actualizar Datos', provider: 'Proveedor', account: 'Cuenta', status: 'Conexión', freshness: 'Frescura', lastPoll: 'Último Poll', token: 'Ventana Del Token', message: 'Mensaje De Conexión', mode: 'Modo', config: 'Configuración', oauth: 'OAuth Listo', mock: 'Modo Mock', ready: 'Listo', missing: 'Falta', missingFields: 'Falta Configuración', authorize: 'Iniciar OAuth', callbackCode: 'Código De Autorización', callbackPlaceholder: 'Pega el código de autorización', finishOauth: 'Completar OAuth', tokenStatus: 'Estado Del Token', tokenIssued: 'Token Emitido', tokenRefresh: 'Última Renovación', accessPreview: 'Token Access', refreshPreview: 'Token Refresh', hasRefresh: 'Refresh Disponible', refreshToken: 'Renovar Token', autoRefresh: 'Auto Refresh', nextPoll: 'Siguiente Poll', refreshedNow: 'Actualizado Ahora', noRefreshNeeded: 'No Hace Falta', refreshFailed: 'Falló El Refresh', idleState: 'En Espera', active: 'Activo', expiringSoon: 'Por Vencer', expired: 'Vencido', missingToken: 'Falta', disconnected: 'Desconectado', connected: 'Conectado', error: 'Necesita Atención', live: 'Actual', delayed: 'Con Retraso', stale: 'Antiguo', offline: 'Sin Conexión' },
  fr: { title: 'Connexion Dexcom', connect: 'Connecter Dexcom', disconnect: 'Déconnecter Dexcom', refresh: 'Actualiser Les Données', provider: 'Fournisseur', account: 'Compte', status: 'Connexion', freshness: 'Fraîcheur', lastPoll: 'Dernier Poll', token: 'Fenêtre Du Token', message: 'Message De Connexion', mode: 'Mode', config: 'Configuration', oauth: 'OAuth Prêt', mock: 'Mode Mock', ready: 'Prêt', missing: 'Manquant', missingFields: 'Configuration Manquante', authorize: 'Démarrer OAuth', callbackCode: 'Code D’autorisation', callbackPlaceholder: 'Collez le code d’autorisation', finishOauth: 'Terminer OAuth', tokenStatus: 'Statut Du Token', tokenIssued: 'Token Émis', tokenRefresh: 'Dernier Rafraîchissement', accessPreview: 'Token Access', refreshPreview: 'Token Refresh', hasRefresh: 'Refresh Disponible', refreshToken: 'Rafraîchir Le Token', autoRefresh: 'Auto Refresh', nextPoll: 'Prochain Poll', refreshedNow: 'Actualisé Maintenant', noRefreshNeeded: 'Refresh Inutile', refreshFailed: 'Échec Du Refresh', idleState: 'En Attente', active: 'Actif', expiringSoon: 'Expire Bientôt', expired: 'Expiré', missingToken: 'Manquant', disconnected: 'Déconnecté', connected: 'Connecté', error: 'Attention Requise', live: 'En Direct', delayed: 'Retardé', stale: 'Périmé', offline: 'Hors Ligne' },
  de: { title: 'Dexcom-Verbindung', connect: 'Dexcom Verbinden', disconnect: 'Dexcom Trennen', refresh: 'Daten Aktualisieren', provider: 'Anbieter', account: 'Konto', status: 'Verbindung', freshness: 'Frische', lastPoll: 'Letzter Poll', token: 'Token-Fenster', message: 'Verbindungsnachricht', mode: 'Modus', config: 'Konfig', oauth: 'OAuth Bereit', mock: 'Mock-Modus', ready: 'Bereit', missing: 'Fehlt', missingFields: 'Fehlende Konfig', authorize: 'OAuth Starten', callbackCode: 'Autorisierungscode', callbackPlaceholder: 'Autorisierungscode einfügen', finishOauth: 'OAuth Abschließen', tokenStatus: 'Token-Status', tokenIssued: 'Token Ausgestellt', tokenRefresh: 'Letzte Token-Aktualisierung', accessPreview: 'Access-Token', refreshPreview: 'Refresh-Token', hasRefresh: 'Refresh Verfügbar', refreshToken: 'Token Aktualisieren', autoRefresh: 'Auto Refresh', nextPoll: 'Nächster Poll', refreshedNow: 'Gerade Aktualisiert', noRefreshNeeded: 'Kein Refresh Nötig', refreshFailed: 'Refresh Fehlgeschlagen', idleState: 'Leerlauf', active: 'Aktiv', expiringSoon: 'Läuft Bald Ab', expired: 'Abgelaufen', missingToken: 'Fehlt', disconnected: 'Getrennt', connected: 'Verbunden', error: 'Braucht Aufmerksamkeit', live: 'Aktuell', delayed: 'Verzögert', stale: 'Veraltet', offline: 'Offline' },
  zh: { title: 'Dexcom 连接', connect: '连接 Dexcom', disconnect: '断开 Dexcom', refresh: '刷新数据', provider: '提供方', account: '账户', status: '连接状态', freshness: '新鲜度', lastPoll: '最近 Poll', token: '令牌窗口', message: '连接消息', mode: '模式', config: '配置', oauth: 'OAuth 已就绪', mock: '模拟模式', ready: '已就绪', missing: '缺失', missingFields: '缺少配置', authorize: '启动 OAuth', callbackCode: '授权码', callbackPlaceholder: '粘贴授权码', finishOauth: '完成 OAuth', tokenStatus: '令牌状态', tokenIssued: '令牌签发', tokenRefresh: '最近刷新', accessPreview: 'Access 令牌', refreshPreview: 'Refresh 令牌', hasRefresh: '可刷新', refreshToken: '刷新令牌', autoRefresh: '自动刷新', nextPoll: '下一次 Poll', refreshedNow: '刚刚已刷新', noRefreshNeeded: '无需刷新', refreshFailed: '刷新失败', idleState: '空闲', active: '有效', expiringSoon: '即将过期', expired: '已过期', missingToken: '缺失', disconnected: '未连接', connected: '已连接', error: '需要关注', live: '实时', delayed: '延迟', stale: '过旧', offline: '离线' },
  ja: { title: 'Dexcom 接続', connect: 'Dexcom を接続', disconnect: 'Dexcom を切断', refresh: 'データを更新', provider: 'プロバイダー', account: 'アカウント', status: '接続状態', freshness: '鮮度', lastPoll: '最終 Poll', token: 'トークン期間', message: '接続メッセージ', mode: 'モード', config: '設定', oauth: 'OAuth 準備完了', mock: 'モックモード', ready: '準備完了', missing: '不足', missingFields: '不足設定', authorize: 'OAuth を開始', callbackCode: '認可コード', callbackPlaceholder: '認可コードを貼り付け', finishOauth: 'OAuth を完了', tokenStatus: 'トークン状態', tokenIssued: 'トークン発行', tokenRefresh: '最終更新', accessPreview: 'Access トークン', refreshPreview: 'Refresh トークン', hasRefresh: 'Refresh 利用可', refreshToken: 'トークン更新', autoRefresh: '自動更新', nextPoll: '次の Poll', refreshedNow: '今更新済み', noRefreshNeeded: '更新不要', refreshFailed: '更新失敗', idleState: '待機中', active: '有効', expiringSoon: 'まもなく期限切れ', expired: '期限切れ', missingToken: '不足', disconnected: '未接続', connected: '接続中', error: '要確認', live: '最新', delayed: '遅延', stale: '古い', offline: 'オフライン' },
  pt: { title: 'Conexão Dexcom', connect: 'Conectar Dexcom', disconnect: 'Desconectar Dexcom', refresh: 'Atualizar Dados', provider: 'Provedor', account: 'Conta', status: 'Conexão', freshness: 'Atualidade', lastPoll: 'Último Poll', token: 'Janela Do Token', message: 'Mensagem Da Conexão', mode: 'Modo', config: 'Configuração', oauth: 'OAuth Pronto', mock: 'Modo Mock', ready: 'Pronto', missing: 'Falta', missingFields: 'Configuração Faltando', authorize: 'Iniciar OAuth', callbackCode: 'Código De Autorização', callbackPlaceholder: 'Cole o código de autorização', finishOauth: 'Concluir OAuth', tokenStatus: 'Status Do Token', tokenIssued: 'Token Emitido', tokenRefresh: 'Última Renovação', accessPreview: 'Token Access', refreshPreview: 'Token Refresh', hasRefresh: 'Refresh Disponível', refreshToken: 'Atualizar Token', autoRefresh: 'Auto Refresh', nextPoll: 'Próximo Poll', refreshedNow: 'Atualizado Agora', noRefreshNeeded: 'Sem Refresh Necessário', refreshFailed: 'Refresh Falhou', idleState: 'Em Espera', active: 'Ativo', expiringSoon: 'Expira Em Breve', expired: 'Expirado', missingToken: 'Faltando', disconnected: 'Desconectado', connected: 'Conectado', error: 'Precisa Atenção', live: 'Ao Vivo', delayed: 'Atrasado', stale: 'Antigo', offline: 'Offline' },
  he: { title: 'חיבור Dexcom', connect: 'חבר Dexcom', disconnect: 'נתק Dexcom', refresh: 'רענן נתונים', provider: 'ספק', account: 'חשבון', status: 'חיבור', freshness: 'טריות', lastPoll: 'Poll אחרון', token: 'חלון טוקן', message: 'הודעת חיבור', mode: 'מצב', config: 'הגדרה', oauth: 'OAuth מוכן', mock: 'מצב Mock', ready: 'מוכן', missing: 'חסר', missingFields: 'הגדרות חסרות', authorize: 'התחל OAuth', callbackCode: 'קוד הרשאה', callbackPlaceholder: 'הדבק קוד הרשאה', finishOauth: 'סיים OAuth', tokenStatus: 'סטטוס טוקן', tokenIssued: 'טוקן הונפק', tokenRefresh: 'רענון אחרון', accessPreview: 'Access טוקן', refreshPreview: 'Refresh טוקן', hasRefresh: 'Refresh זמין', refreshToken: 'רענן טוקן', autoRefresh: 'רענון אוטומטי', nextPoll: 'Poll הבא', refreshedNow: 'רוענן עכשיו', noRefreshNeeded: 'אין צורך ברענון', refreshFailed: 'הרענון נכשל', idleState: 'בהמתנה', active: 'פעיל', expiringSoon: 'יפוג בקרוב', expired: 'פג תוקף', missingToken: 'חסר', disconnected: 'לא מחובר', connected: 'מחובר', error: 'צריך תשומת לב', live: 'חי', delayed: 'בעיכוב', stale: 'מיושן', offline: 'אופליין' },
  ar: { title: 'اتصال Dexcom', connect: 'ربط Dexcom', disconnect: 'فصل Dexcom', refresh: 'تحديث البيانات', provider: 'المزوّد', account: 'الحساب', status: 'الاتصال', freshness: 'حداثة البيانات', lastPoll: 'آخر Poll', token: 'نافذة الرمز', message: 'رسالة الاتصال', mode: 'الوضع', config: 'الإعداد', oauth: 'OAuth جاهز', mock: 'وضع Mock', ready: 'جاهز', missing: 'ناقص', missingFields: 'الإعدادات الناقصة', authorize: 'ابدأ OAuth', callbackCode: 'رمز التفويض', callbackPlaceholder: 'ألصق رمز التفويض', finishOauth: 'أكمل OAuth', tokenStatus: 'حالة الرمز', tokenIssued: 'إصدار الرمز', tokenRefresh: 'آخر تحديث', accessPreview: 'رمز Access', refreshPreview: 'رمز Refresh', hasRefresh: 'Refresh متاح', refreshToken: 'حدّث الرمز', autoRefresh: 'تحديث تلقائي', nextPoll: 'Poll التالي', refreshedNow: 'تم التحديث الآن', noRefreshNeeded: 'لا حاجة للتحديث', refreshFailed: 'فشل التحديث', idleState: 'انتظار', active: 'نشط', expiringSoon: 'سينتهي قريبًا', expired: 'منتهي', missingToken: 'مفقود', disconnected: 'غير متصل', connected: 'متصل', error: 'يحتاج انتباهًا', live: 'مباشر', delayed: 'متأخر', stale: 'قديم', offline: 'غير متصل' },
};

const statusTone = (status: 'done' | 'active' | 'waiting') =>
  status === 'done'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
    : status === 'active'
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/12 dark:text-amber-200'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

const PRODUCT_LABELS: Record<Language, {
  glucose: string;
  trend: string;
  confidence: string;
  confidenceNote: string;
  dataHealth: string;
  data: string;
  mode: string;
  device: string;
  lastSync: string;
  signalAge: string;
  lastGood: string;
  connected: string;
  delayed: string;
  offline: string;
  live: string;
  waiting: string;
  down: string;
  up: string;
  flat: string;
  unknown: string;
  high: string;
  medium: string;
  low: string;
  day: string;
  night: string;
}> = {
  en: { glucose: 'Glucose', trend: 'Trend', confidence: 'Confidence', confidenceNote: 'Confidence Note', dataHealth: 'Data Health', data: 'Data', mode: 'Mode', device: 'Device', lastSync: 'Last Sync', signalAge: 'Signal Age', lastGood: 'Last Good Reading', connected: 'Connected', delayed: 'Delayed', offline: 'Offline', live: 'Live', waiting: 'Waiting', down: 'Down', up: 'Up', flat: 'Flat', unknown: 'Unknown', high: 'High', medium: 'Medium', low: 'Low', day: 'Day', night: 'Night' },
  ru: { glucose: 'Глюкоза', trend: 'Тренд', confidence: 'Надёжность', confidenceNote: 'Что Влияет На Надёжность', dataHealth: 'Качество Данных', data: 'Данные', mode: 'Режим', device: 'Устройство', lastSync: 'Последняя Синхронизация', signalAge: 'Возраст Сигнала', lastGood: 'Последний Надёжный Сигнал', connected: 'Подключено', delayed: 'С Задержкой', offline: 'Не В Сети', live: 'Свежие', waiting: 'Ожидание', down: 'Падает', up: 'Растёт', flat: 'Ровно', unknown: 'Неизвестно', high: 'Высокая', medium: 'Средняя', low: 'Низкая', day: 'День', night: 'Ночь' },
  uk: { glucose: 'Глюкоза', trend: 'Тренд', confidence: 'Надійність', confidenceNote: 'Що Впливає На Надійність', dataHealth: 'Якість Даних', data: 'Дані', mode: 'Режим', device: 'Пристрій', lastSync: 'Остання Синхронізація', signalAge: 'Вік Сигналу', lastGood: 'Останній Надійний Сигнал', connected: 'Підключено', delayed: 'Із Затримкою', offline: 'Не В Мережі', live: 'Свіжі', waiting: 'Очікування', down: 'Падає', up: 'Зростає', flat: 'Рівно', unknown: 'Невідомо', high: 'Висока', medium: 'Середня', low: 'Низька', day: 'День', night: 'Ніч' },
  es: { glucose: 'Glucosa', trend: 'Tendencia', confidence: 'Confianza', confidenceNote: 'Nota De Confianza', dataHealth: 'Salud De Los Datos', data: 'Datos', mode: 'Modo', device: 'Dispositivo', lastSync: 'Última Sincronización', signalAge: 'Edad De La Señal', lastGood: 'Última Lectura Buena', connected: 'Conectado', delayed: 'Con Retraso', offline: 'Sin Conexión', live: 'Actual', waiting: 'En Espera', down: 'Bajando', up: 'Subiendo', flat: 'Estable', unknown: 'Desconocido', high: 'Alta', medium: 'Media', low: 'Baja', day: 'Día', night: 'Noche' },
  fr: { glucose: 'Glycémie', trend: 'Tendance', confidence: 'Fiabilité', confidenceNote: 'Note De Fiabilité', dataHealth: 'Qualité Des Données', data: 'Données', mode: 'Mode', device: 'Appareil', lastSync: 'Dernière Synchronisation', signalAge: 'Âge Du Signal', lastGood: 'Dernière Bonne Lecture', connected: 'Connecté', delayed: 'Retardé', offline: 'Hors Ligne', live: 'Actuel', waiting: 'En Attente', down: 'En Baisse', up: 'En Hausse', flat: 'Stable', unknown: 'Inconnu', high: 'Élevée', medium: 'Moyenne', low: 'Faible', day: 'Jour', night: 'Nuit' },
  de: { glucose: 'Glukose', trend: 'Trend', confidence: 'Zuverlässigkeit', confidenceNote: 'Hinweis Zur Zuverlässigkeit', dataHealth: 'Datenqualität', data: 'Daten', mode: 'Modus', device: 'Gerät', lastSync: 'Letzte Synchronisierung', signalAge: 'Signalalter', lastGood: 'Letzte Gute Messung', connected: 'Verbunden', delayed: 'Verzögert', offline: 'Offline', live: 'Aktuell', waiting: 'Warten', down: 'Sinkt', up: 'Steigt', flat: 'Stabil', unknown: 'Unbekannt', high: 'Hoch', medium: 'Mittel', low: 'Niedrig', day: 'Tag', night: 'Nacht' },
  zh: { glucose: '葡萄糖', trend: '趋势', confidence: '可信度', confidenceNote: '可信度说明', dataHealth: '数据状态', data: '数据', mode: '模式', device: '设备', lastSync: '最近同步', signalAge: '信号时长', lastGood: '最近可靠读数', connected: '已连接', delayed: '有延迟', offline: '离线', live: '实时', waiting: '等待中', down: '下降', up: '上升', flat: '平稳', unknown: '未知', high: '高', medium: '中', low: '低', day: '白天', night: '夜间' },
  ja: { glucose: 'グルコース', trend: '傾向', confidence: '信頼度', confidenceNote: '信頼度メモ', dataHealth: 'データの状態', data: 'データ', mode: 'モード', device: 'デバイス', lastSync: '最終同期', signalAge: '信号の経過時間', lastGood: '直近の正常読値', connected: '接続中', delayed: '遅延', offline: 'オフライン', live: '最新', waiting: '待機中', down: '下降', up: '上昇', flat: '安定', unknown: '不明', high: '高い', medium: '中くらい', low: '低い', day: '昼', night: '夜' },
  pt: { glucose: 'Glicose', trend: 'Tendência', confidence: 'Confiança', confidenceNote: 'Nota De Confiança', dataHealth: 'Saúde Dos Dados', data: 'Dados', mode: 'Modo', device: 'Dispositivo', lastSync: 'Última Sincronização', signalAge: 'Idade Do Sinal', lastGood: 'Última Leitura Boa', connected: 'Conectado', delayed: 'Atrasado', offline: 'Offline', live: 'Atual', waiting: 'Em Espera', down: 'Caindo', up: 'Subindo', flat: 'Estável', unknown: 'Desconhecido', high: 'Alta', medium: 'Média', low: 'Baixa', day: 'Dia', night: 'Noite' },
  he: { glucose: 'גלוקוז', trend: 'מגמה', confidence: 'אמינות', confidenceNote: 'הערת אמינות', dataHealth: 'מצב הנתונים', data: 'נתונים', mode: 'מצב', device: 'מכשיר', lastSync: 'סנכרון אחרון', signalAge: 'גיל האות', lastGood: 'הקריאה התקינה האחרונה', connected: 'מחובר', delayed: 'בעיכוב', offline: 'לא מחובר', live: 'עדכני', waiting: 'ממתין', down: 'יורד', up: 'עולה', flat: 'יציב', unknown: 'לא ידוע', high: 'גבוהה', medium: 'בינונית', low: 'נמוכה', day: 'יום', night: 'לילה' },
  ar: { glucose: 'الجلوكوز', trend: 'الاتجاه', confidence: 'الثقة', confidenceNote: 'ملاحظة الثقة', dataHealth: 'حالة البيانات', data: 'البيانات', mode: 'الوضع', device: 'الجهاز', lastSync: 'آخر مزامنة', signalAge: 'عمر الإشارة', lastGood: 'آخر قراءة جيدة', connected: 'متصل', delayed: 'متأخر', offline: 'غير متصل', live: 'مباشر', waiting: 'انتظار', down: 'ينخفض', up: 'يرتفع', flat: 'مستقر', unknown: 'غير معروف', high: 'عالية', medium: 'متوسطة', low: 'منخفضة', day: 'النهار', night: 'الليل' },
};

const deviceTone = (status: 'connected' | 'delayed' | 'offline') =>
  status === 'connected'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
    : status === 'delayed'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300';

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  user,
  lang,
  setLang,
  theme,
  setTheme,
  onLogout,
  onBackToPublic,
  onSignUp,
  workspace,
  onAction, onPreferencesSave, onDexcomConnect, onDexcomOAuthStart, onDexcomOAuthFinish, onDexcomTokenRefresh, onDexcomDisconnect, onDexcomPoll, onNutritionAnalyze, onWorkspaceRefresh }) => {
  const diabetesType = workspace?.household?.diabetesType ?? readSignupDiabetesType() ?? 'type1';
  const memberCopy = MEMBER_CHROME_COPY[lang];
  const copy = resolveWorkspaceCopy(lang, diabetesType);
  const preferenceCopy = PREFERENCE_COPY[lang];
  const notificationCopy = NOTIFICATION_COPY[lang];
  const deliveryCopy = DELIVERY_COPY[lang];
  const householdCopy = HOUSEHOLD_COPY[lang];
  const reviewCopy = REVIEW_COPY[lang];
  const dexcomOpsCopy = DEXCOM_OPS_COPY[lang];
  const guidanceCopy = GUIDANCE_COPY[lang];
  const readinessCopy = READINESS_COPY[lang];
  const summaryCopy = SUMMARY_COPY[lang];
  const layoutCopy = LAYOUT_COPY[lang];
  const dexcomCopy = DEXCOM_COPY[lang];
  const labels = PRODUCT_LABELS[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const roleLabels = getRoleLabels(lang, workspace?.household?.diabetesType ?? 'type1');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(workspace?.selectedSession?.id || null);
  const [preferences, setPreferences] = React.useState(() => {
    const prefs = workspace?.household?.safetyPreferences;
    return prefs
      ? { ...prefs, glucoseUnit: normalizeGlucoseUnit(prefs.glucoseUnit) }
      : null;
  });
  const [savingPreferences, setSavingPreferences] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<WorkspaceSectionId>('now');
  const [actionFeedback, setActionFeedback] = React.useState<{ title: string; body: string; next: string } | null>(null);
  const [actionBusy, setActionBusy] = React.useState(false);
  const [connectionBusy, setConnectionBusy] = React.useState(false);
  const [nutritionBusy, setNutritionBusy] = React.useState(false);
  const [inviteCopied, setInviteCopied] = React.useState(false);

  React.useEffect(() => {
    setSelectedSessionId(workspace?.selectedSession?.id || workspace?.dailyHistory[0]?.id || null);
  }, [workspace?.selectedSession?.id, workspace?.dailyHistory]);
  React.useEffect(() => {
    const prefs = workspace?.household?.safetyPreferences;
    setPreferences(
      prefs
        ? {
            ...prefs,
            glucoseUnit: normalizeGlucoseUnit(prefs.glucoseUnit),
          }
        : null,
    );
  }, [workspace?.household?.safetyPreferences]);

  if (!workspace || workspace.needsSetup || !workspace.household || !workspace.currentState || !workspace.morningSummary) {
    return (
      <MemberZoneShell
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        isRTL={isRTL}
        diabetesType={diabetesType}
        activePageLabel={memberCopy.activeWorkspace}
        accountLabel={memberCopy.signOut}
        onAccountAction={onLogout}
        onBackToPublic={onBackToPublic}
        onSignUp={onSignUp}
      >
        <div className={`${t1dMemberLayout()} relative`}>
          <div className={`${t1dPanelPrimary(theme)} ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-lg font-black tracking-tight">{copy.currentState}</p>
          </div>
        </div>
      </MemberZoneShell>
    );
  }

  const household = workspace.household;
  const currentState = workspace.currentState;
  const deviceStatus = workspace.deviceStatus;
  const dexcom = workspace.dexcomConnection;
  const morningSummary = workspace.morningSummary;
  const preferenceExplainer = resolvePreferenceExplainer(lang, household.diabetesType, preferenceCopy.explainer);
  const selectedSession: SessionDetail | null =
    workspace.dailyHistory.find((entry) => entry.id === selectedSessionId) || workspace.selectedSession || null;
  const trendLabel = labels[currentState.trend];
  const confidenceLabel = labels[currentState.confidence];
  const dataLabel = labels[currentState.dataStatus];
  const deviceStatusLabel = deviceStatus ? labels[deviceStatus.status] : labels.waiting;
  const modeLabel = labels[currentState.mode];
  const failCopy = {
    ...copy.failStates,
    ...resolveFailStateHints(lang, household.diabetesType, {
      dayHint: copy.failStates.dayHint,
      nightHint: copy.failStates.nightHint,
    }),
  };
  const roleKey = (user.role === 'caregiver' ? 'caregiver' : user.role === 'adult' ? 'adult' : 'parent');
  const hasOfflineData = currentState.dataStatus === 'offline' || deviceStatus?.status === 'offline';
  const hasDelayedData = currentState.dataStatus === 'delayed' || deviceStatus?.status === 'delayed';
  const hasWaitingData = currentState.dataStatus === 'waiting';
  const displayHeadline =
    hasOfflineData ? failCopy.offlineTitle :
    hasWaitingData ? failCopy.waitingTitle :
    hasDelayedData ? failCopy.delayedTitle :
    currentState.headline;
  const displayRecommendation =
    hasOfflineData ? failCopy.offlineBody[roleKey] :
    hasWaitingData ? failCopy.waitingBody[roleKey] :
    hasDelayedData ? failCopy.delayedBody[roleKey] :
    currentState.recommendation;
  const modeHint = currentState.mode === 'night' ? failCopy.nightHint : failCopy.dayHint;
  const dataHealthSummary = deviceStatus
    ? `${dataLabel} · ${deviceStatus.signalAgeMinutes === null ? '--' : `${deviceStatus.signalAgeMinutes}m`} · ${confidenceLabel}`
    : `${dataLabel} · ${confidenceLabel}`;
  const preferencesSummary = preferences
    ? `${preferenceCopy.fields.day}: ${preferenceCopy.options[preferences.daySensitivity]} · ${preferenceCopy.fields.night}: ${preferenceCopy.options[preferences.nightSensitivity]} · ${preferenceCopy.fields.dayContact}: ${roleLabels[preferences.dayPrimaryContact]} · ${preferenceCopy.fields.nightContact}: ${roleLabels[preferences.nightPrimaryContact]} · ${preferences.caregiverDelaySeconds}${preferenceCopy.options.seconds}`
    : null;
  const notificationSummary = workspace.notificationSummary;
  const notificationFeed = workspace.notificationFeed || [];
  const deliveryStatusLabel = notificationSummary
    ? ({
        quiet: deliveryCopy.quiet,
        delivered: deliveryCopy.delivered,
        retrying: deliveryCopy.retrying,
        escalated: deliveryCopy.escalated,
      }[notificationSummary.deliveryStatus])
    : null;
  const notificationSummaryLine = notificationSummary
    ? `${notificationCopy.dayFlow}: ${notificationCopy.settings[notificationSummary.daySensitivity]} · ${roleLabels[notificationSummary.dayPrimaryContact]} · ${notificationCopy.nightFlow}: ${notificationCopy.settings[notificationSummary.nightSensitivity]} · ${roleLabels[notificationSummary.nightPrimaryContact]} · ${notificationCopy.backup}: ${notificationSummary.caregiverEnabled ? `${notificationSummary.caregiverDelaySeconds}${preferenceCopy.options.seconds}` : notificationCopy.disabled}`
    : null;
  const notificationMetaLine = notificationSummary
    ? `${deliveryCopy.channel}: ${deliveryCopy.push} · ${deliveryCopy.target}: ${roleLabels[notificationSummary.activeRecipient]} · ${deliveryCopy.attempts}: ${notificationSummary.totalAttempts} · ${deliveryStatusLabel}`
    : null;
  const reviewSummary = workspace.reviewSummary;
  const dailyGuidance = workspace.dailyGuidance;
  const householdReadiness = workspace.householdReadiness;
  const contextualSummary = workspace.contextualSummary;
  const reviewLabel = (value: 'strong' | 'watch' | 'fragile') => value === 'strong' ? reviewCopy.strong : value === 'watch' ? reviewCopy.watch : reviewCopy.fragile;
  const patternLabel = (value: 'steady' | 'repeat-risk' | 'escalation-heavy') => value === 'steady' ? reviewCopy.steady : value === 'repeat-risk' ? reviewCopy.repeatRisk : reviewCopy.escalationHeavy;
  const [oauthCode, setOauthCode] = React.useState('');
  const dexcomModeLabel = dexcom ? (dexcom.authMode === 'oauth_ready' ? dexcomCopy.oauth : dexcomCopy.mock) : '';
  const dexcomConfigLabel = dexcom ? (dexcom.configStatus === 'ready' ? dexcomCopy.ready : dexcomCopy.missing) : '';
  const dexcomTokenStatusLabel = dexcom ? ({
    active: dexcomCopy.active,
    expiring_soon: dexcomCopy.expiringSoon,
    expired: dexcomCopy.expired,
    missing: dexcomCopy.missingToken,
  }[dexcom.tokenStatus]) : '';
  const dexcomAutoRefreshLabel = dexcom ? ({
    idle: dexcomCopy.idleState,
    not_needed: dexcomCopy.noRefreshNeeded,
    refreshed: dexcomCopy.refreshedNow,
    failed: dexcomCopy.refreshFailed,
  }[dexcom.autoRefreshState]) : '';
  const canStartOAuth = Boolean(dexcom?.configStatus === 'ready' && dexcom?.authorizePath);

  const dexcomStatusLabel = dexcom
    ? ({
        disconnected: dexcomCopy.disconnected,
        connected: dexcomCopy.connected,
        error: dexcomCopy.error,
      }[dexcom.status])
    : null;
  const dexcomFreshnessLabel = dexcom
    ? ({
        live: dexcomCopy.live,
        delayed: dexcomCopy.delayed,
        stale: dexcomCopy.stale,
        offline: dexcomCopy.offline,
      }[dexcom.dataFreshness])
    : null;
  const dexcomHealth = workspace.dexcomHealth;
  const dexcomScheduler = workspace.dexcomScheduler;
  const dexcomAuditTrail = workspace.dexcomAuditTrail || [];
  const dexcomHealthLabel = dexcomHealth
    ? ({
        healthy: dexcomOpsCopy.healthy,
        watch: dexcomOpsCopy.watch,
        broken: dexcomOpsCopy.broken,
      }[dexcomHealth.state])
    : null;
  const dexcomSchedulerLabel = dexcomScheduler
    ? ({
        idle: dexcomOpsCopy.idle,
        scheduled: dexcomOpsCopy.scheduled,
        paused: dexcomOpsCopy.paused,
        running: dexcomOpsCopy.running,
      }[dexcomScheduler.state])
    : null;
  const dexcomDeviceRuntimeLabel = dexcom
    ? ({
        connected: labels.connected,
        offline: labels.offline,
        unknown: labels.unknown,
      }[dexcom.deviceRuntime])
    : null;
  const supportDetails =
    user.role === 'adult'
      ? [
          [copy.householdName, household.householdName],
          [copy.childCard, household.childName || user.fullName || user.email],
          [copy.responder, currentState.responder],
          [copy.nightWindow, household.nightWindow],
        ]
      : user.role === 'caregiver'
        ? [
            [copy.householdName, household.householdName],
            [copy.primaryParent, household.primaryParent],
            [copy.caregiver, household.caregiverName],
            [copy.responder, currentState.responder],
          ]
        : [
            [copy.householdName, household.householdName],
            [copy.primaryParent, household.primaryParent],
            [copy.caregiver, household.caregiverName],
            [copy.nightWindow, household.nightWindow],
        ];

  const handlePreferenceSave = async () => {
    if (!preferences) return;
    setSavingPreferences(true);
    try {
      await onPreferencesSave(preferences);
    } finally {
      setSavingPreferences(false);
    }
  };

  const primaryPanelClass = t1dPanelPrimary(theme);
  const subtlePanelClass = t1dPanelSubtle(theme);
  const surfacePanelClass = `${t1dPanelSurface(theme)} ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`;
  const compactCardClass = t1dPanelCompact(theme);
  const compactSurfaceCardClass = t1dPanelCompactSurface(theme);
  const secondaryHeadingClass = 'mt-4 text-lg font-extrabold tracking-tight md:text-xl';
  const softLabelClass = t1dSoftLabel(theme);
  const glucoseCopy = GLUCOSE_DISPLAY_COPY[lang];
  const nowCopy = WORKSPACE_NOW_COPY[lang];
  const visualCopy = WORKSPACE_VISUAL_COPY[lang];
  const glucoseUnit = normalizeGlucoseUnit(preferences?.glucoseUnit);
  const sectionHeaders = resolveWorkspaceSectionHeaders(lang, household.diabetesType);
  const inviteCopy = resolveWorkspaceInviteCopy(lang, household.diabetesType);
  const nutrition = workspace.nutrition ?? createEmptyNutritionPayload(NUTRITION_COPY[lang].cameraHint);

  const handleActionClick = async (action: ActionId) => {
    setActionBusy(true);
    try {
      await onAction(action);
      setActionFeedback(resolveActionFeedback(lang, action));
      setActiveSection('timeline');
    } catch {
      setActionFeedback({
        title: lang === 'ru' ? 'Не удалось сохранить действие' : 'Could not save action',
        body: lang === 'ru' ? 'Проверьте соединение и попробуйте ещё раз.' : 'Check your connection and try again.',
        next: '',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const handleNutritionSubmit = async (payload: { imageBase64?: string; note?: string }) => {
    setNutritionBusy(true);
    try {
      await onNutritionAnalyze(payload);
      setActionFeedback({
        title: lang === 'ru' ? 'Еда сохранена' : 'Meal saved',
        body: lang === 'ru' ? 'Отчёт добавлен в хронологию и учтён вместе с глюкозой.' : 'Report added to your timeline and linked with glucose.',
        next: lang === 'ru' ? 'Смотрите отчёт в разделе «Еда».' : 'See the full report in Meals.',
      });
    } finally {
      setNutritionBusy(false);
    }
  };

  const wrapConnection = (fn: () => Promise<void>) => async () => {
    setConnectionBusy(true);
    try {
      await fn();
    } finally {
      setConnectionBusy(false);
    }
  };

  const copyInviteCode = async () => {
    if (!household.inviteCode || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setInviteCopied(true);
      window.setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      setInviteCopied(false);
    }
  };

  const sectionEyebrowClass = t1dEyebrow(theme);
  const workspaceSectionShell = theme === 'dark' ? 't1d-workspace-section t1d-workspace-section--dark' : 't1d-workspace-section t1d-workspace-section--light';
  const workspaceStat = theme === 'dark' ? 't1d-workspace-stat t1d-workspace-stat--dark' : 't1d-workspace-stat t1d-workspace-stat--light';

  return (
    <>
      <MemberZoneShell
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        isRTL={isRTL}
        diabetesType={household.diabetesType}
        activePageLabel={memberCopy.activeWorkspace}
        accountLabel={memberCopy.signOut}
        onAccountAction={onLogout}
        onBackToPublic={onBackToPublic}
        onSignUp={onSignUp}
      >
        <div className={`${t1dMemberLayout()} ${memberLayoutTypeClass(household.diabetesType)} relative`}>
        <WorkspaceBetaBanner lang={lang} theme={theme} isRTL={isRTL} />

        <div className={`t1d-workspace-shell ${workspaceShellTypeClass(household.diabetesType)} ${isRTL ? 't1d-workspace-shell--rtl' : ''}`}>
          <WorkspaceSidebar active={activeSection} onSelect={setActiveSection} theme={theme} lang={lang} isRTL={isRTL} diabetesType={household.diabetesType} />
          <div className="t1d-workspace-main">
            {actionFeedback ? (
              <WorkspaceActionBanner
                title={actionFeedback.title}
                body={actionFeedback.body}
                nextHint={actionFeedback.next}
                theme={theme}
                isRTL={isRTL}
                onDismiss={() => setActionFeedback(null)}
                onOpenTimeline={() => setActiveSection('timeline')}
                openTimelineLabel={nowCopy.openTimeline}
              />
            ) : null}
            {activeSection === 'now' ? (
          <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
            <GlucoseNowDashboard
              lang={lang}
              theme={theme}
              isRTL={isRTL}
              diabetesType={household.diabetesType}
              glucoseUnit={glucoseUnit}
              currentState={currentState}
              dexcom={dexcom}
              recentMeals={nutrition?.recentMeals ?? []}
              trendLabel={trendLabel}
              dataFieldLabel={labels.data}
              dataStatusLabel={dataLabel}
              responderLabel={copy.responder}
              stateLabel={copy.stateLabels[currentState.level]}
              modeLabels={{ day: labels.day, night: labels.night }}
              headline={displayHeadline}
              recommendation={displayRecommendation}
            />
            <WorkspaceNowPanel
              lang={lang}
              theme={theme}
              isRTL={isRTL}
              diabetesType={household.diabetesType}
              currentState={currentState}
              contextualSummary={contextualSummary}
              dailyGuidance={dailyGuidance}
              householdReadiness={householdReadiness}
              guidanceLabels={guidanceCopy}
              readinessLabels={readinessCopy}
            />
            {nutrition?.insight ? (
              <button
                type="button"
                onClick={() => setActiveSection('nutrition')}
                className={`mt-5 w-full rounded-2xl border p-4 text-left transition ${theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400/50' : 'border-emerald-200 bg-emerald-50/90 hover:border-emerald-300'}`}
              >
                <p className="text-base font-bold">{nutrition.insight.headline}</p>
                <p className="mt-2 text-base leading-relaxed">{nutrition.insight.detail}</p>
              </button>
            ) : null}
            <div className={`mt-5 border-t pt-5 ${theme === 'dark' ? 'border-slate-800' : 'border-orange-100'}`}>
              <p className="mb-3 text-sm font-bold">{copy.quickActions}</p>
              {(currentState.level === 'watch' || currentState.level === 'risk') ? (
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => handleActionClick('all_ok')}
                  className={`mb-3 w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}
                >
                  {nowCopy.allClear}
                </button>
              ) : null}
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {workspace.quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleActionClick(action.id)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                      theme === 'dark'
                        ? 'border-amber-400/30 bg-stone-950/40 text-amber-50 hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/10'
                        : 'border-orange-200 bg-white text-stone-900 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10'
                    }`}
                  >
                    {ACTION_LABELS[lang][action.id]}
                  </button>
                ))}
                {workspace.quickActions.length > 0 ? (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleActionClick('DONE')}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold sm:col-span-2 ${t1dBtnPrimary(theme)}`}
                  >
                    {copy.doneAction}
                  </button>
                ) : null}
              </div>
            </div>
          </section>
            ) : null}

            {activeSection === 'nutrition' ? (
          <div className={`${primaryPanelClass} ${workspaceSectionShell}`}>
          <FoodAnalysisPanel
            lang={lang}
            theme={theme}
            isRTL={isRTL}
            sectionTitle={sectionHeaders.nutrition.title}
            sectionSubtitle={sectionHeaders.nutrition.subtitle}
            nutrition={nutrition}
            onAnalyze={handleNutritionSubmit}
            busy={nutritionBusy}
          />
          </div>
            ) : null}

            {activeSection === 'system' ? (
          <ConnectionPanel
            lang={lang}
            theme={theme}
            isRTL={isRTL}
            sectionTitle={sectionHeaders.system.title}
            sectionSubtitle={sectionHeaders.system.subtitle}
            deviceStatus={deviceStatus}
            dexcom={dexcom}
            glucoseUnit={glucoseUnit}
            glucoseLabel={labels.glucose}
            trendLabel={dexcom?.latestTrend ? labels[dexcom.latestTrend] : labels.flat}
            onConnect={wrapConnection(onDexcomConnect)}
            onDisconnect={wrapConnection(onDexcomDisconnect)}
            onPoll={wrapConnection(onDexcomPoll)}
            busy={connectionBusy}
          />
            ) : null}

            {activeSection === 'timeline' ? (
          <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
            <WorkspaceSectionHeader title={sectionHeaders.timeline.title} subtitle={sectionHeaders.timeline.subtitle} theme={theme} isRTL={isRTL} />
            <div className="mt-5">
              <EventTimeline
                lang={lang}
                theme={theme}
                isRTL={isRTL}
                user={user}
                compactCardClass={compactCardClass}
                onWorkspaceRefresh={onWorkspaceRefresh}
              />
            </div>
          </section>
            ) : null}

            {activeSection === 'settings' ? (
          <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
            <WorkspaceSectionHeader title={sectionHeaders.settings.title} subtitle={sectionHeaders.settings.subtitle} theme={theme} isRTL={isRTL} />
            {preferences ? (
              <>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">{preferenceExplainer}</p>
                <div className="mt-5 grid max-w-lg gap-4">
                  <label className="space-y-2">
                    <span className={softLabelClass}>{glucoseCopy.unitField}</span>
                    <select
                      value={preferences.glucoseUnit}
                      onChange={(event) =>
                        setPreferences((current) =>
                          current ? { ...current, glucoseUnit: normalizeGlucoseUnit(event.target.value) } : current,
                        )
                      }
                      className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}
                    >
                      <option value="mmol/L">{glucoseUnitOptionLabel(lang, 'mmol/L')}</option>
                      <option value="mg/dL">{glucoseUnitOptionLabel(lang, 'mg/dL')}</option>
                    </select>
                    <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{glucoseCopy.unitHint}</p>
                  </label>
                  <label className="space-y-2">
                    <span className={softLabelClass}>{preferenceCopy.fields.day}</span>
                    <select value={preferences.daySensitivity} onChange={(event) => setPreferences((current) => current ? { ...current, daySensitivity: event.target.value as SafetyPreferencesInput['daySensitivity'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="gentle">{preferenceCopy.options.gentle}</option>
                      <option value="balanced">{preferenceCopy.options.balanced}</option>
                      <option value="watchful">{preferenceCopy.options.watchful}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className={softLabelClass}>{preferenceCopy.fields.night}</span>
                    <select value={preferences.nightSensitivity} onChange={(event) => setPreferences((current) => current ? { ...current, nightSensitivity: event.target.value as SafetyPreferencesInput['nightSensitivity'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="balanced">{preferenceCopy.options.balanced}</option>
                      <option value="protective">{preferenceCopy.options.protective}</option>
                      <option value="urgent">{preferenceCopy.options.urgent}</option>
                    </select>
                  </label>
                  <button type="button" onClick={handlePreferenceSave} disabled={savingPreferences} className={`mt-2 rounded-2xl px-4 py-3 text-sm font-semibold ${t1dBtnPrimary(theme)} disabled:opacity-50`}>
                    {savingPreferences ? preferenceCopy.saving : preferenceCopy.save}
                  </button>
                </div>
              </>
            ) : null}
          </section>
            ) : null}

            {activeSection === 'alerts' && notificationSummary && preferences ? (
              <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
                <WorkspaceSectionHeader title={sectionHeaders.alerts.title} subtitle={sectionHeaders.alerts.subtitle} theme={theme} isRTL={isRTL} />
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.explainer}</p>
                {deliveryStatusLabel ? (
                  <AlertFlowDiagram
                    lang={lang}
                    theme={theme}
                    isRTL={isRTL}
                    diabetesType={household.diabetesType}
                    notificationSummary={notificationSummary}
                    roleLabels={roleLabels}
                    deliveryStatusLabel={deliveryStatusLabel}
                    sensitivityLabels={notificationCopy.settings}
                  />
                ) : null}
                <div className="mt-5 grid max-w-2xl gap-4">
                  <div className={`${subtlePanelClass} px-4 py-4`}>
                    <p className={softLabelClass}>{notificationCopy.dayFlow}</p>
                    <p className="mt-2 text-sm font-semibold">{roleLabels[notificationSummary.dayPrimaryContact]}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.descriptions.day[notificationSummary.daySensitivity]}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-4`}>
                    <p className={softLabelClass}>{notificationCopy.nightFlow}</p>
                    <p className="mt-2 text-sm font-semibold">{roleLabels[notificationSummary.nightPrimaryContact]}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.descriptions.night[notificationSummary.nightSensitivity]}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-4`}>
                    <p className={softLabelClass}>{notificationCopy.backup}</p>
                    <p className="mt-2 text-sm font-semibold">
                      {notificationSummary.caregiverEnabled
                        ? `${household.caregiverName || roleLabels.caregiver} · ${notificationCopy.enabled}`
                        : notificationCopy.disabled}
                    </p>
                  </div>
                  <label className="space-y-2">
                    <span className={softLabelClass}>{preferenceCopy.fields.dayContact}</span>
                    <select value={preferences.dayPrimaryContact} onChange={(event) => setPreferences((current) => current ? { ...current, dayPrimaryContact: event.target.value as SafetyPreferencesInput['dayPrimaryContact'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="parent">{roleLabels.parent}</option>
                      <option value="adult">{roleLabels.adult}</option>
                      {household.caregiverName ? <option value="caregiver">{roleLabels.caregiver}</option> : null}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className={softLabelClass}>{preferenceCopy.fields.nightContact}</span>
                    <select value={preferences.nightPrimaryContact} onChange={(event) => setPreferences((current) => current ? { ...current, nightPrimaryContact: event.target.value as SafetyPreferencesInput['nightPrimaryContact'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="parent">{roleLabels.parent}</option>
                      <option value="adult">{roleLabels.adult}</option>
                      {household.caregiverName ? <option value="caregiver">{roleLabels.caregiver}</option> : null}
                    </select>
                  </label>
                  <button type="button" onClick={handlePreferenceSave} disabled={savingPreferences} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${t1dBtnPrimary(theme)} disabled:opacity-50`}>
                    {savingPreferences ? preferenceCopy.saving : preferenceCopy.save}
                  </button>
                </div>
                {notificationFeed.length > 0 ? (
                  <div className="mt-6 max-w-2xl">
                    <p className={softLabelClass}>{deliveryCopy.feed}</p>
                    <div className="mt-3 space-y-2">
                      {notificationFeed.slice(0, 5).map((item) => (
                        <div key={item.id} className={`rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                          <p className="text-sm font-semibold">{roleLabels[item.recipientRole]} · {item.timeLabel}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeSection === 'history' ? (
          <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'} pb-6`}>
            <WorkspaceSectionHeader title={sectionHeaders.history.title} subtitle={sectionHeaders.history.subtitle} theme={theme} isRTL={isRTL} />
            <div className={`mt-5 ${compactCardClass}`}>
              <p className={softLabelClass}>{nowCopy.yesterdayGlance}</p>
              <p className="mt-2 text-base font-bold leading-relaxed">{morningSummary.headline}</p>
              <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">{morningSummary.outcome}</p>
              <p className="mt-3 text-sm font-semibold">{copy.responders}: {morningSummary.responders.join(', ')}</p>
            </div>
            {workspace.dailyHistory.length === 0 ? (
              <div className={`mt-5 rounded-[1.2rem] border p-4 md:rounded-[1.35rem] ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-50/90 text-slate-600'}`}>
                <p className="text-sm leading-relaxed">{copy.noHistory}</p>
              </div>
            ) : (
              <div className="mt-5 grid max-w-3xl gap-3">
                {workspace.dailyHistory.map((entry) => {
                  const expanded = selectedSession?.id === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className={`rounded-[1.2rem] border transition md:rounded-[1.35rem] ${
                        expanded
                          ? theme === 'dark'
                            ? 'border-amber-400/60 bg-amber-400/5'
                            : 'border-orange-300 bg-orange-50/80'
                          : theme === 'dark'
                            ? 'border-slate-800 bg-slate-900/70'
                            : 'border-slate-200 bg-slate-50/90'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedSessionId(expanded ? null : entry.id)}
                        className={`w-full p-4 ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className={softLabelClass}>{entry.dateLabel}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-slate-950 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                            {expanded ? visualCopy.collapse : copy.viewDetail}
                          </span>
                        </div>
                        <p className="mt-2 text-[15px] font-black tracking-tight md:text-base">{entry.headline}</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.outcome}</p>
                      </button>
                      {expanded ? (
                        <div className={`border-t px-4 pb-4 pt-3 ${theme === 'dark' ? 'border-slate-800' : 'border-orange-100'}`}>
                          <DailyHistoryChart
                            lang={lang}
                            theme={theme}
                            isRTL={isRTL}
                            diabetesType={household.diabetesType}
                            glucoseUnit={glucoseUnit}
                            entry={entry}
                          />
                          <div className="mt-4 flex flex-wrap gap-4 text-sm">
                            <span><span className={softLabelClass}>{copy.alerts}</span> <strong>{entry.alertsCount}</strong></span>
                            <span><span className={softLabelClass}>{copy.actions}</span> <strong>{entry.actionsCount}</strong></span>
                            <span><span className={softLabelClass}>{copy.escalations}</span> <strong>{entry.escalationCount}</strong></span>
                          </div>
                          <p className="mt-3 text-sm opacity-80">{copy.responders}: {entry.responders.join(', ')}</p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
            ) : null}

            {activeSection === 'family' ? (
        <section className={`${primaryPanelClass} ${workspaceSectionShell} ${isRTL ? 'text-right' : 'text-left'}`}>
          <WorkspaceSectionHeader title={sectionHeaders.family.title} subtitle={sectionHeaders.family.subtitle} theme={theme} isRTL={isRTL} />
          <div className="mt-5 max-w-2xl space-y-4">
            <div className={`${typeCardClass(household.diabetesType, theme)} p-5 md:p-6`}>
              <p className={softLabelClass}>{DIABETES_TYPE_COPY[lang].field}</p>
              <p className="mt-2 text-lg font-extrabold tracking-tight">{DIABETES_TYPE_COPY[lang][diabetesTypeKey(household.diabetesType)].label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{DIABETES_TYPE_COPY[lang][diabetesTypeKey(household.diabetesType)].description}</p>
            </div>
            <div className={`${subtlePanelClass} p-5 md:p-6`}>
              <p className={softLabelClass}>{copy.childCard}</p>
              <p className="mt-2 text-lg font-extrabold tracking-tight">{household.childName} · {household.childAgeBand}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copy.primaryParent}: {household.primaryParent}</p>
              {household.caregiverName ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.caregiver}: {household.caregiverName}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:gap-6">
            <div className={`${subtlePanelClass} p-5 md:p-6`}>
              <p className="text-base font-extrabold tracking-tight">{inviteCopy.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{inviteCopy.body}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <code className="t1d-invite-code">{household.inviteCode || '------'}</code>
                <button type="button" onClick={copyInviteCode} className={`${t1dBtnSecondary(theme)} text-sm`}>
                  {inviteCopied ? inviteCopy.copied : inviteCopy.copyLabel}
                </button>
              </div>
            </div>
            <div className={`${subtlePanelClass} p-4`}>
              <p className={softLabelClass}>{householdCopy.members}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {household.members.map((member) => (
                  <div
                    key={member.id}
                    className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-black tracking-tight">{member.fullName}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                      }`}>
                        {member.status === 'active' ? householdCopy.active : householdCopy.invited}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{roleLabels[member.role]}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.email || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
            ) : null}

          </div>
        </div>
        </div>
      </MemberZoneShell>
      <WorkspaceOnboarding lang={lang} theme={theme} diabetesType={household.diabetesType} onGoToNutrition={() => setActiveSection('nutrition')} />
    </>
  );
};

export default WorkspaceView;
