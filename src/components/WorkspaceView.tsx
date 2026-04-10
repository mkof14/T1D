import React from 'react';
import type { AccessUser } from './AccessView';
import type { CurrentStatePayload, SafetyPreferencesInput, SessionDetail, WorkspacePayload } from '../lib/api';
import { ROLE_LABELS, RTL_LANGUAGES, type Language } from '../types';
import { WORKSPACE_COPY } from '../content/workspace-copy';

interface WorkspaceViewProps {
  user: AccessUser;
  lang: Language;
  theme: 'light' | 'dark';
  onLogout: () => void;
  workspace: WorkspacePayload | null;
  onAction: () => Promise<void>;
  onPreferencesSave: (preferences: SafetyPreferencesInput) => Promise<void>;
  onDexcomConnect: () => Promise<void>;
  onDexcomOAuthStart: () => Promise<void>;
  onDexcomOAuthFinish: (code: string) => Promise<void>;
  onDexcomTokenRefresh: () => Promise<void>;
  onDexcomDisconnect: () => Promise<void>;
  onDexcomPoll: () => Promise<void>;
}

const STATE_TONE: Record<CurrentStatePayload['level'], string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300',
  watch: 'bg-sky-100 text-sky-800 dark:bg-sky-500/12 dark:text-sky-300',
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
      ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/12 dark:text-sky-300'
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

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({ user, lang, theme, onLogout, workspace, onAction, onPreferencesSave, onDexcomConnect, onDexcomOAuthStart, onDexcomOAuthFinish, onDexcomTokenRefresh, onDexcomDisconnect, onDexcomPoll }) => {
  const copy = WORKSPACE_COPY[lang];
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
  const roleLabels = ROLE_LABELS[lang];
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(workspace?.selectedSession?.id || null);
  const [preferences, setPreferences] = React.useState(workspace?.household?.safetyPreferences || null);
  const [savingPreferences, setSavingPreferences] = React.useState(false);

  React.useEffect(() => {
    setSelectedSessionId(workspace?.selectedSession?.id || workspace?.dailyHistory[0]?.id || null);
  }, [workspace?.selectedSession?.id, workspace?.dailyHistory]);
  React.useEffect(() => {
    setPreferences(workspace?.household?.safetyPreferences || null);
  }, [workspace?.household?.safetyPreferences]);

  if (!workspace || workspace.needsSetup || !workspace.household || !workspace.currentState || !workspace.morningSummary) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${theme === 'dark' ? 'bg-[#0d1827] text-slate-100' : 'bg-[#f3f8fb] text-slate-900'}`}>
        <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6 md:py-12">
          <div className={`rounded-[2rem] border p-6 md:p-8 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(22,37,55,0.94),rgba(18,30,47,0.9))]' : 'border-slate-200 bg-white'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-lg font-black tracking-tight">{copy.currentState}</p>
          </div>
        </div>
      </div>
    );
  }

  const household = workspace.household;
  const currentState = workspace.currentState;
  const deviceStatus = workspace.deviceStatus;
  const dexcom = workspace.dexcomConnection;
  const morningSummary = workspace.morningSummary;
  const focus = copy.roleFocus[user.role];
  const selectedSession: SessionDetail | null =
    workspace.dailyHistory.find((entry) => entry.id === selectedSessionId) || workspace.selectedSession || null;
  const trendLabel = labels[currentState.trend];
  const confidenceLabel = labels[currentState.confidence];
  const dataLabel = labels[currentState.dataStatus];
  const deviceStatusLabel = deviceStatus ? labels[deviceStatus.status] : labels.waiting;
  const modeLabel = labels[currentState.mode];
  const failCopy = copy.failStates;
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
          [copy.childCard, user.fullName || user.email],
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

  const primaryPanelClass = `rounded-[1.8rem] border p-5 md:rounded-[2rem] md:p-7 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(22,37,55,0.94),rgba(18,30,47,0.9))]' : 'border-slate-200 bg-white/95'}`;
  const subtlePanelClass = `rounded-[1.35rem] border ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(27,43,62,0.9),rgba(21,35,52,0.86))]' : 'border-slate-200 bg-slate-50/90'}`;
  const surfacePanelClass = `rounded-[1.35rem] border ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(24,39,58,0.92),rgba(19,32,49,0.88))] text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`;
  const compactCardClass = `rounded-[1.2rem] border p-3 md:rounded-[1.35rem] md:p-4 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(27,43,62,0.9),rgba(21,35,52,0.86))]' : 'border-slate-200 bg-slate-50/90'}`;
  const compactSurfaceCardClass = `rounded-[1.2rem] border p-3 md:rounded-[1.35rem] md:p-4 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(24,39,58,0.92),rgba(19,32,49,0.88))]' : 'border-slate-200 bg-white'}`;
  const secondaryHeadingClass = 'mt-4 text-lg font-black tracking-tight md:text-xl';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen ${theme === 'dark' ? 'bg-[#0d1827] text-slate-100' : 'bg-[#f3f8fb] text-slate-900'}`}>
      <div className="mx-auto max-w-[1120px] px-4 py-8 md:px-6 md:py-10">
        <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-700 dark:text-sky-300">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">{copy.welcome}, {user.fullName || user.email}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{focus.body}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className={`rounded-full px-5 py-3 text-[11px] font-black uppercase tracking-[0.16em] ${
              theme === 'dark' ? 'bg-slate-950 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
            }`}
          >
            {copy.signOut}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6">
          <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.currentState}</p>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${STATE_TONE[currentState.level]}`}>
                {copy.stateLabels[currentState.level]}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight">{displayHeadline}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{displayRecommendation}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{modeHint}</p>
            {contextualSummary ? (
              <div className={`mt-4 overflow-hidden rounded-[1.6rem] border ${theme === 'dark' ? 'border-slate-800 bg-slate-900/75' : 'border-slate-200 bg-slate-50/95'}`}>
                <div className={`h-1.5 w-full ${
                  contextualSummary.tone === 'calm'
                    ? 'bg-emerald-400/80'
                    : contextualSummary.tone === 'watch'
                      ? 'bg-amber-400/80'
                      : 'bg-rose-400/80'
                }`} />
                <div className="px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{summaryCopy.title}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                      contextualSummary.tone === 'calm'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                        : contextualSummary.tone === 'watch'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                    }`}>
                      {contextualSummary.tone === 'calm' ? summaryCopy.calm : contextualSummary.tone === 'watch' ? summaryCopy.watch : summaryCopy.attention}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{contextualSummary.headline}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{contextualSummary.detail}</p>
                </div>
              </div>
            ) : null}
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{labels.glucose}</p>
                <p className="mt-2 text-3xl font-black tracking-tight">{currentState.glucose ?? '--'}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{labels.trend}</p>
                <p className="mt-2 text-lg font-black tracking-tight">{trendLabel}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{labels.data}: {dataLabel}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{labels.confidence}</p>
                <p className="mt-2 text-lg font-black tracking-tight">{confidenceLabel}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{labels.mode}: {modeLabel}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{copy.responder}</p>
                <p className="mt-2 text-lg font-black tracking-tight">{currentState.responder}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{currentState.acknowledgedAt}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className={`${subtlePanelClass} px-4 py-4`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{labels.dataHealth}</p>
                  <p className="text-sm font-black tracking-tight">{dataHealthSummary}</p>
                </div>
                {deviceStatus ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{deviceStatus.confidenceNote}</p>
                ) : null}
              </div>
              {householdReadiness ? (
                <div className={`${subtlePanelClass} px-4 py-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{readinessCopy.title}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                      householdReadiness.state === 'ready'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                        : householdReadiness.state === 'watch'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                    }`}>
                      {householdReadiness.state === 'ready' ? readinessCopy.ready : householdReadiness.state === 'watch' ? readinessCopy.watch : readinessCopy.needsAttention}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{householdReadiness.headline}</p>
                </div>
              ) : null}
              {notificationSummary && notificationSummaryLine ? (
                <div className={`${subtlePanelClass} px-4 py-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{notificationCopy.summary}</p>
                    <p className="text-sm font-black tracking-tight">{notificationSummary.mode === 'night' ? labels.night : labels.day}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationMetaLine}</p>
                </div>
              ) : null}
            </div>
            {preferencesSummary ? (
              <div className={`mt-4 ${subtlePanelClass} px-4 py-4`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{preferenceCopy.summary}</p>
                  <p className="text-sm font-black tracking-tight">{preferencesSummary}</p>
                </div>
              </div>
            ) : null}
            {notificationSummary && notificationSummaryLine ? (
              <div className={`mt-4 ${subtlePanelClass} px-4 py-4`}>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationSummaryLine}</p>
              </div>
            ) : null}
          </section>

          <section className={`rounded-[1.8rem] border p-5 md:rounded-[2rem] md:p-7 ${theme === 'dark' ? 'border-slate-800 bg-[linear-gradient(145deg,#091423_0%,#0d1a2b_50%,#11263f_100%)]' : 'border-slate-200 bg-[linear-gradient(145deg,#f6f8fb_0%,#eef4f8_50%,#f7fbff_100%)]'} ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{focus.title}</p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.system}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {deviceStatus ? (
                <div className={`${surfacePanelClass} px-4 py-3 sm:col-span-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.device}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${deviceTone(deviceStatus.status)}`}>{deviceStatusLabel}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{deviceStatus.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{labels.lastSync}: {deviceStatus.lastSync}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.signalAge}</p>
                      <p className="mt-1 text-sm font-semibold">{deviceStatus.signalAgeMinutes === null ? '--' : `${deviceStatus.signalAgeMinutes}m`}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.lastGood}</p>
                      <p className="mt-1 text-sm font-semibold">{deviceStatus.lastGoodReading}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.confidenceNote}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{deviceStatus.confidenceNote}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{deviceStatus.message}</p>
                </div>
              ) : null}
              {dexcom ? (
                <div className={`${surfacePanelClass} px-4 py-3 sm:col-span-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.title}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                      dexcom?.status === 'connected'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                        : dexcom?.status === 'error'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {dexcomStatusLabel}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.provider}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.provider}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.device}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.deviceLabel || 'Dexcom CGM'}{dexcomDeviceRuntimeLabel ? ` · ${dexcomDeviceRuntimeLabel}` : ''}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.account}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.accountName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.mode}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcomModeLabel || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.config}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcomConfigLabel || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.freshness}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcomFreshnessLabel || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.lastPoll}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.lastPollAt || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.glucose}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.latestGlucose ?? '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{labels.trend}</p>
                      <p className="mt-1 text-sm font-semibold">{labels[dexcom.latestTrend]}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.token}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.tokenExpiresAt || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.tokenStatus}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcomTokenStatusLabel || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.tokenIssued}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.tokenIssuedAt || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.tokenRefresh}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.lastTokenRefreshAt || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.autoRefresh}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcomAutoRefreshLabel || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.nextPoll}</p>
                      <p className="mt-1 text-sm font-semibold">{dexcom.nextPollDueAt || '—'}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.message}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcom.message}</p>
                    {dexcom.lastError ? (
                      <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">{dexcom.lastError}</p>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.accessPreview}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcom.accessTokenPreview || '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.refreshPreview}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcom.refreshTokenPreview || '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.hasRefresh}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcom.hasRefreshToken ? dexcomCopy.ready : dexcomCopy.missingToken}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.missingFields}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcom.missingConfig.length ? dexcom.missingConfig.join(', ') : '—'}</p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="block">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomCopy.callbackCode}</p>
                      <input
                        value={oauthCode}
                        onChange={(event) => setOauthCode(event.target.value)}
                        placeholder={dexcomCopy.callbackPlaceholder}
                        className={`mt-2 w-full rounded-2xl border px-3 py-2 text-sm ${theme === 'dark' ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => onDexcomOAuthFinish(oauthCode)}
                        className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900' : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
                      >
                        {dexcomCopy.finishOauth}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onDexcomConnect}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                    >
                      {dexcomCopy.connect}
                    </button>
                    <button
                      type="button"
                      onClick={onDexcomOAuthStart}
                      disabled={!canStartOAuth}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${canStartOAuth ? (theme === 'dark' ? 'border border-emerald-700 bg-transparent text-emerald-300 hover:bg-emerald-950/30' : 'border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50') : 'cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600'}`}
                    >
                      {dexcomCopy.authorize}
                    </button>
                    <button
                      type="button"
                      onClick={onDexcomPoll}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'border border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900' : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
                    >
                      {dexcomCopy.refresh}
                    </button>
                    <button
                      type="button"
                      onClick={onDexcomTokenRefresh}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'border border-violet-700 bg-transparent text-violet-300 hover:bg-violet-950/30' : 'border border-violet-300 bg-white text-violet-700 hover:bg-violet-50'}`}
                    >
                      {dexcomCopy.refreshToken}
                    </button>
                    <button
                      type="button"
                      onClick={onDexcomDisconnect}
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'border border-rose-700 bg-transparent text-rose-300 hover:bg-rose-950/30' : 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50'}`}
                    >
                      {dexcomCopy.disconnect}
                    </button>
                  </div>
                </div>
              ) : null}
                </div>
              </div>
              {dexcomHealth || dexcomScheduler ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.logs}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {dexcomHealth ? (
                      <div className={`${surfacePanelClass} px-4 py-3 sm:col-span-2`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.health}</p>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                            dexcomHealth.state === 'healthy'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                              : dexcomHealth.state === 'watch'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                          }`}>
                            {dexcomHealthLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold">{dexcomHealth.headline}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcomHealth.detail}</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.lastSuccess}</p>
                            <p className="mt-1 text-sm font-semibold">{dexcomHealth.lastSuccessAt || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.lastFailure}</p>
                            <p className="mt-1 text-sm font-semibold">{dexcomHealth.lastFailureAt || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.failures}</p>
                            <p className="mt-1 text-sm font-semibold">{dexcomHealth.consecutiveFailures}</p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-2xl border border-slate-200/60 px-3 py-3 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.nextStep}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcomHealth.nextStep}</p>
                        </div>
                      </div>
                    ) : null}
                    {dexcomScheduler ? (
                      <div className={`${surfacePanelClass} px-4 py-3 sm:col-span-2`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.scheduler}</p>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                            dexcomScheduler.state === 'running'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/12 dark:text-sky-300'
                              : dexcomScheduler.state === 'paused'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {dexcomSchedulerLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{dexcomScheduler.headline}</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.nextRun}</p>
                            <p className="mt-1 text-sm font-semibold">{dexcomScheduler.nextRunAt || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.lastRun}</p>
                            <p className="mt-1 text-sm font-semibold">{dexcomScheduler.lastRunAt || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.pausedUntil}</p>
                            <p className="mt-1 text-sm font-semibold">{dexcomScheduler.pausedUntil || '—'}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.support}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {supportDetails.map(([label, value]) => (
                <div
                  key={label}
                  className={`${surfacePanelClass} px-4 py-3`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-sm font-semibold">{value}</p>
                </div>
              ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
          <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.timeline}</p>
            <div className="mt-5 space-y-4">
              {workspace.timeline.map((item) => (
                <div key={item.id} className={compactCardClass}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[15px] font-black tracking-tight md:text-base">{item.step}</p>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(item.status)}`}>
                      {copy.timelineStatus[item.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.actor} · {item.time}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5 lg:space-y-6">
            <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.quickActions}</p>
              <div className="mt-4 space-y-2.5">
                {workspace.quickActions.length > 0 ? (
                  <button
                    type="button"
                    onClick={onAction}
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-black tracking-[0.02em] ${theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                  >
                    {copy.doneAction}
                  </button>
                ) : null}
              </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
            {dailyGuidance ? (
              <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.guidance}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{guidanceCopy.title}</p>
                <h3 className={secondaryHeadingClass}>{dailyGuidance.title}</h3>
                <div className="mt-5 grid gap-3">
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{guidanceCopy.now}</p>
                    <p className="mt-2 text-sm leading-relaxed">{dailyGuidance.now}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{guidanceCopy.watch}</p>
                    <p className="mt-2 text-sm leading-relaxed">{dailyGuidance.watch}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{guidanceCopy.fallback}</p>
                    <p className="mt-2 text-sm leading-relaxed">{dailyGuidance.fallback}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{guidanceCopy.checklist}</p>
                    <div className="mt-3 space-y-2">
                      {dailyGuidance.checklist.map((item) => (
                        <p key={item} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {householdReadiness ? (
              <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.guidance}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{readinessCopy.title}</p>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                    householdReadiness.state === 'ready'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                      : householdReadiness.state === 'watch'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                  }`}>
                    {householdReadiness.state === 'ready' ? readinessCopy.ready : householdReadiness.state === 'watch' ? readinessCopy.watch : readinessCopy.needsAttention}
                  </span>
                </div>
                <h3 className={secondaryHeadingClass}>{householdReadiness.headline}</h3>
                <div className="mt-5 grid gap-3">
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{readinessCopy.connection}</p>
                    <p className="mt-2 text-sm leading-relaxed">{householdReadiness.connection}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{readinessCopy.backup}</p>
                    <p className="mt-2 text-sm leading-relaxed">{householdReadiness.backup}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{readinessCopy.responder}</p>
                    <p className="mt-2 text-sm leading-relaxed">{householdReadiness.responder}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{readinessCopy.recovery}</p>
                    <p className="mt-2 text-sm leading-relaxed">{householdReadiness.recovery}</p>
                  </div>
                </div>
              </section>
            ) : null}
            </div>

            {notificationSummary ? (
              <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.logs}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{notificationCopy.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.explainer}</p>
                <div className="mt-5 grid gap-3">
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{notificationCopy.activeNow}</p>
                    <p className="mt-2 text-sm font-semibold">{notificationSummary.mode === 'night' ? labels.night : labels.day}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{notificationCopy.dayFlow}</p>
                    <p className="mt-2 text-sm font-semibold">{notificationCopy.settings[notificationSummary.daySensitivity]} · {roleLabels[notificationSummary.dayPrimaryContact]}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.descriptions.day[notificationSummary.daySensitivity]}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{notificationCopy.nightFlow}</p>
                    <p className="mt-2 text-sm font-semibold">{notificationCopy.settings[notificationSummary.nightSensitivity]} · {roleLabels[notificationSummary.nightPrimaryContact]}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{notificationCopy.descriptions.night[notificationSummary.nightSensitivity]}</p>
                  </div>
                  <div className={`${subtlePanelClass} px-4 py-3`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{notificationCopy.backup}</p>
                    <p className="mt-2 text-sm font-semibold">
                      {notificationSummary.caregiverEnabled
                        ? `${notificationCopy.enabled} · ${notificationSummary.caregiverDelaySeconds}${preferenceCopy.options.seconds}`
                        : notificationCopy.disabled}
                    </p>
                  </div>
                  <div className={`rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{deliveryCopy.target}</p>
                    <p className="mt-2 text-sm font-semibold">{roleLabels[notificationSummary.activeRecipient]}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{deliveryCopy.channel}: {deliveryCopy.push} · {deliveryCopy.attempts}: {notificationSummary.totalAttempts}</p>
                  </div>
                    <div className={`${subtlePanelClass} px-4 py-3`}>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{deliveryCopy.feed}</p>
                      <div className="mt-3 space-y-2.5">
                      {notificationFeed.map((item) => {
                        const itemStatusLabel = ({
                          sent: deliveryCopy.sent,
                          delivered: deliveryCopy.delivered,
                          retrying: deliveryCopy.retrying,
                          escalated: deliveryCopy.escalated,
                          resolved: deliveryCopy.resolved,
                        })[item.status];
                        return (
                          <div key={item.id} className={`rounded-[1.1rem] border p-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-white'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-black tracking-tight">{roleLabels[item.recipientRole]} · {item.recipientName}</p>
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                                item.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                                  : item.status === 'escalated'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                                    : item.status === 'retrying'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                                      : 'bg-sky-100 text-sky-800 dark:bg-sky-500/12 dark:text-sky-300'
                              }`}>
                                {itemStatusLabel}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{deliveryCopy.channel}: {deliveryCopy.push} · {item.timeLabel}</p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {dexcomAuditTrail.length > 0 ? (
                    <div className={`${subtlePanelClass} px-4 py-3`}>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{dexcomOpsCopy.audit}</p>
                      <div className="mt-3 space-y-2.5">
                        {dexcomAuditTrail.slice(0, 4).map((item) => (
                          <div key={item.id} className={`rounded-[1.1rem] border p-3 ${theme === 'dark' ? 'border-slate-700 bg-slate-950/60' : 'border-slate-200 bg-white'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-black tracking-tight">{item.headline}</p>
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                                item.status === 'ok'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                                  : item.status === 'warning'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300'
                              }`}>
                                {item.status === 'ok' ? dexcomOpsCopy.ok : item.status === 'warning' ? dexcomOpsCopy.warning : dexcomOpsCopy.error}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.time}</p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
            <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.settings}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.roleChecklist}</p>
              <h3 className={secondaryHeadingClass}>{focus.title}</h3>
              <div className="mt-4 space-y-2.5">
                {focus.points.map((point) => (
                  <div
                    key={point}
                    className={`rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}
                  >
                    <p className="text-sm font-semibold leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </section>

            {preferences ? (
              <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.settings}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{preferenceCopy.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{preferenceCopy.explainer}</p>
                <div className="mt-5 grid gap-4">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{preferenceCopy.fields.day}</span>
                    <select value={preferences.daySensitivity} onChange={(event) => setPreferences((current) => current ? { ...current, daySensitivity: event.target.value as SafetyPreferencesInput['daySensitivity'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="gentle">{preferenceCopy.options.gentle}</option>
                      <option value="balanced">{preferenceCopy.options.balanced}</option>
                      <option value="watchful">{preferenceCopy.options.watchful}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{preferenceCopy.fields.night}</span>
                    <select value={preferences.nightSensitivity} onChange={(event) => setPreferences((current) => current ? { ...current, nightSensitivity: event.target.value as SafetyPreferencesInput['nightSensitivity'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="balanced">{preferenceCopy.options.balanced}</option>
                      <option value="protective">{preferenceCopy.options.protective}</option>
                      <option value="urgent">{preferenceCopy.options.urgent}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{preferenceCopy.fields.delay}</span>
                    <select value={preferences.caregiverDelaySeconds} onChange={(event) => setPreferences((current) => current ? { ...current, caregiverDelaySeconds: Number(event.target.value) as SafetyPreferencesInput['caregiverDelaySeconds'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value={20}>20 {preferenceCopy.options.seconds}</option>
                      <option value={40}>40 {preferenceCopy.options.seconds}</option>
                      <option value={60}>60 {preferenceCopy.options.seconds}</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{preferenceCopy.fields.dayContact}</span>
                    <select value={preferences.dayPrimaryContact} onChange={(event) => setPreferences((current) => current ? { ...current, dayPrimaryContact: event.target.value as SafetyPreferencesInput['dayPrimaryContact'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="parent">{roleLabels.parent}</option>
                      <option value="adult">{roleLabels.adult}</option>
                      {household.caregiverName ? <option value="caregiver">{roleLabels.caregiver}</option> : null}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{preferenceCopy.fields.nightContact}</span>
                    <select value={preferences.nightPrimaryContact} onChange={(event) => setPreferences((current) => current ? { ...current, nightPrimaryContact: event.target.value as SafetyPreferencesInput['nightPrimaryContact'] } : current)} className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-slate-50/90 text-slate-900'}`}>
                      <option value="parent">{roleLabels.parent}</option>
                      <option value="adult">{roleLabels.adult}</option>
                      {household.caregiverName ? <option value="caregiver">{roleLabels.caregiver}</option> : null}
                    </select>
                  </label>
                  <button type="button" onClick={handlePreferenceSave} disabled={savingPreferences} className={`mt-2 rounded-2xl px-4 py-3 text-sm font-black tracking-[0.02em] ${theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200 disabled:bg-slate-700 disabled:text-slate-300' : 'bg-slate-950 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500'}`}>
                    {savingPreferences ? preferenceCopy.saving : preferenceCopy.save}
                  </button>
                </div>
              </section>
            ) : null}
            </div>

            <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
            <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.review}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.morningSummary}</p>
              <h3 className="mt-4 text-xl font-black tracking-tight">{morningSummary.headline}</h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className={compactCardClass}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.alerts}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">{morningSummary.alertsCount}</p>
                </div>
                <div className={compactCardClass}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.actions}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">{morningSummary.actionsCount}</p>
                </div>
                <div className={compactCardClass}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.escalations}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">{morningSummary.escalationCount}</p>
                </div>
              </div>
              <div className={`mt-4 ${compactCardClass}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.responders}</p>
                <p className="mt-2 text-sm font-semibold">{morningSummary.responders.join(', ')}</p>
              </div>
              <div className={`mt-4 ${compactCardClass}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.outcome}</p>
                <p className="mt-2 text-sm leading-relaxed">{morningSummary.outcome}</p>
              </div>
            </section>

            {reviewSummary ? (
              <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{layoutCopy.review}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{reviewCopy.title}</p>
                <h3 className={secondaryHeadingClass}>{reviewSummary.headline}</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className={compactCardClass}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.score}</p>
                    <p className="mt-2 text-2xl font-black tracking-tight">{reviewSummary.stabilityScore}</p>
                  </div>
                  <div className={compactCardClass}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.pattern}</p>
                    <p className="mt-2 text-sm font-semibold">{patternLabel(reviewSummary.pattern)}</p>
                  </div>
                  <div className={compactCardClass}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.delivery}</p>
                    <p className="mt-2 text-sm font-semibold">{reviewLabel(reviewSummary.deliveryReliability)}</p>
                  </div>
                  <div className={compactCardClass}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.response}</p>
                    <p className="mt-2 text-sm font-semibold">{reviewLabel(reviewSummary.responseConsistency)}</p>
                  </div>
                </div>
                <div className={`mt-4 ${compactCardClass}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.notes}</p>
                  <div className="mt-3 space-y-2">
                    {reviewSummary.notes.map((note) => (
                      <p key={note} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{note}</p>
                    ))}
                  </div>
                </div>
                <div className={`mt-4 ${compactCardClass}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.nextFocus}</p>
                  <p className="mt-2 text-sm leading-relaxed">{reviewSummary.nextFocus}</p>
                </div>
              </section>
            ) : null}
            </div>

            <section className={`${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.recentEvents}</p>
              <div className="mt-4 space-y-2.5">
                {workspace.recentEvents.map((item) => (
                  <div key={item.id} className={compactCardClass}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-black tracking-tight">{item.step}</p>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(item.status)}`}>
                        {copy.timelineStatus[item.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.actor} · {item.time}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className={`mt-6 ${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.household}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              [copy.childCard, household.childName],
              [copy.ageBand, household.childAgeBand],
              [copy.primaryParent, `${household.primaryParent} · ${roleLabels.parent}`],
              [copy.caregiver, `${household.caregiverName} · ${roleLabels.caregiver}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className={compactCardClass}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-[15px] font-black tracking-tight md:text-base">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr] lg:gap-6">
            <div className={`${subtlePanelClass} p-4`}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{householdCopy.invite}</p>
              <p className="mt-2 text-2xl font-black tracking-[0.18em]">{household.inviteCode || '--'}</p>
            </div>
            <div className={`${subtlePanelClass} p-4`}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{householdCopy.members}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {household.members.map((member) => (
                  <div
                    key={member.id}
                    className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-black tracking-tight">{member.fullName}</p>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                        member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
                      }`}>
                        {member.status === 'active' ? householdCopy.active : householdCopy.invited}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{ROLE_LABELS[lang][member.role]}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{member.email || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`mt-6 ${primaryPanelClass} ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.history}</p>
          {workspace.dailyHistory.length === 0 ? (
            <div className={`mt-5 rounded-[1.2rem] border p-4 md:rounded-[1.35rem] ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-50/90 text-slate-600'}`}>
              <p className="text-sm leading-relaxed">{copy.noHistory}</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
              <div className="grid gap-4">
                {workspace.dailyHistory.map((entry) => {
                  const active = selectedSession?.id === entry.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setSelectedSessionId(entry.id)}
                      className={`rounded-[1.2rem] border p-4 transition md:rounded-[1.35rem] ${isRTL ? 'text-right' : 'text-left'} ${
                        active
                          ? theme === 'dark'
                            ? 'border-sky-400 bg-sky-400/10'
                            : 'border-sky-500 bg-sky-50'
                          : theme === 'dark'
                            ? 'border-slate-800 bg-slate-900/70'
                            : 'border-slate-200 bg-slate-50/90'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{entry.dateLabel}</p>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'bg-slate-950 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                          {copy.viewDetail}
                        </span>
                      </div>
                      <p className="mt-2 text-[15px] font-black tracking-tight md:text-base">{entry.headline}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.outcome}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.alerts}</p>
                          <p className="mt-1 text-lg font-black tracking-tight">{entry.alertsCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.actions}</p>
                          <p className="mt-1 text-lg font-black tracking-tight">{entry.actionsCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.escalations}</p>
                          <p className="mt-1 text-lg font-black tracking-tight">{entry.escalationCount}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSession ? (
                <div className={`rounded-[1.35rem] border p-4 md:rounded-[1.5rem] md:p-6 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">{copy.sessionDetail}</p>
                  <h3 className="mt-3 text-xl font-black tracking-tight md:text-2xl">{selectedSession.headline}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{selectedSession.dateLabel}</p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selectedSession.outcome}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className={compactSurfaceCardClass}>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.alerts}</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">{selectedSession.alertsCount}</p>
                    </div>
                    <div className={compactSurfaceCardClass}>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.actions}</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">{selectedSession.actionsCount}</p>
                    </div>
                    <div className={compactSurfaceCardClass}>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.escalations}</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">{selectedSession.escalationCount}</p>
                    </div>
                  </div>

                  <div className={`mt-4 ${compactSurfaceCardClass}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{copy.responders}</p>
                    <p className="mt-2 text-sm font-semibold">{selectedSession.responders.join(', ')}</p>
                  </div>

                  <div className={`mt-4 ${compactSurfaceCardClass}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.title}</p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.score}</p>
                        <p className="mt-1 text-lg font-black tracking-tight">{selectedSession.review.stabilityScore}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.pattern}</p>
                        <p className="mt-1 text-sm font-semibold">{patternLabel(selectedSession.review.pattern)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.delivery}</p>
                        <p className="mt-1 text-sm font-semibold">{reviewLabel(selectedSession.review.deliveryReliability)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{reviewCopy.response}</p>
                        <p className="mt-1 text-sm font-semibold">{reviewLabel(selectedSession.review.responseConsistency)}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {selectedSession.review.notes.map((note) => (
                        <p key={note} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{note}</p>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed"><span className="font-black">{reviewCopy.nextFocus}: </span>{selectedSession.review.nextFocus}</p>
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{copy.sessionTimeline}</p>
                    <div className="mt-3 space-y-2.5">
                      {selectedSession.timeline.map((item) => (
                        <div key={item.id} className={compactSurfaceCardClass}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-[15px] font-black tracking-tight md:text-base">{item.step}</p>
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusTone(item.status)}`}>
                              {copy.timelineStatus[item.status]}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{item.actor} · {item.time}</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WorkspaceView;
