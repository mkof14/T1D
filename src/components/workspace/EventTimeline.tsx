import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { AccessUser } from '../AccessView';
import type { Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dBtnPrimary, t1dBtnSecondary, t1dPanelCompact } from '../../lib/t1d-ui';
import {
  acknowledgeAlert,
  getPatientTimeline,
  resolveAlert,
  takeAlertOwnership,
  type PatientTimelineEntry,
  type PatientTimelinePayload,
} from '../../lib/api';
import { WORKSPACE_COPY } from '../../content/workspace-copy';

type EventTimelineProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  user: AccessUser;
  compactCardClass: string;
  onWorkspaceRefresh?: () => Promise<void>;
};

const RESPONDER_LABELS: Record<Language, Record<string, string>> = {
  en: {
    no_responder: 'No responder yet',
    notified: 'Family notified',
    acknowledged: 'Acknowledged',
    active_responder: 'Someone is handling this',
    escalated: 'Backup involved',
    resolved: 'Resolved',
    expired: 'Expired',
    acknowledge: 'Acknowledge',
    takeOwnership: 'I am handling this',
    resolve: 'Mark resolved',
    staleTitle: 'CGM data may be stale',
    staleDetail: 'Do not treat glucose as current until fresher readings arrive.',
    loading: 'Loading timeline…',
    empty: 'No events yet. Steady will log alerts, readings, and responses here.',
    error: 'Could not load timeline. Try again.',
    retry: 'Retry',
    glucose: 'Glucose',
    alert: 'Alert',
    system: 'System',
    event: 'Event',
  },
  ru: {
    no_responder: 'Пока никто не ответил',
    notified: 'Семья уведомлена',
    acknowledged: 'Подтверждено',
    active_responder: 'Кто-то уже отвечает',
    escalated: 'Подключён резерв',
    resolved: 'Закрыто',
    expired: 'Истекло',
    acknowledge: 'Подтвердить',
    takeOwnership: 'Я беру на себя',
    resolve: 'Отметить решённым',
    staleTitle: 'Данные CGM могут быть устаревшими',
    staleDetail: 'Не опирайтесь на текущую глюкозу, пока не придут свежие показания.',
    loading: 'Загрузка хронологии…',
    empty: 'Пока событий нет. Steady будет записывать сигналы, показания и ответы здесь.',
    error: 'Не удалось загрузить хронологию. Попробуйте снова.',
    retry: 'Повторить',
    glucose: 'Глюкоза',
    alert: 'Сигнал',
    system: 'Система',
    event: 'Событие',
  },
  uk: {
    no_responder: 'Поки ніхто не відповів',
    notified: 'Родину сповіщено',
    acknowledged: 'Підтверджено',
    active_responder: 'Хтось уже відповідає',
    escalated: 'Підключено резерв',
    resolved: 'Закрито',
    expired: 'Минуло',
    acknowledge: 'Підтвердити',
    takeOwnership: 'Я беру на себе',
    resolve: 'Позначити вирішеним',
    staleTitle: 'Дані CGM можуть бути застарілими',
    staleDetail: 'Не покладайтеся на поточну глюкозу, доки не надійдуть свіжі показники.',
    loading: 'Завантаження хронології…',
    empty: 'Подій поки немає. Steady записуватиме сигнали, показники та відповіді тут.',
    error: 'Не вдалося завантажити хронологію. Спробуйте знову.',
    retry: 'Повторити',
    glucose: 'Глюкоза',
    alert: 'Сигнал',
    system: 'Система',
    event: 'Подія',
  },
  es: {
    no_responder: 'Aún sin respuesta',
    notified: 'Familia avisada',
    acknowledged: 'Confirmado',
    active_responder: 'Alguien está respondiendo',
    escalated: 'Respaldo activo',
    resolved: 'Resuelto',
    expired: 'Caducado',
    acknowledge: 'Confirmar',
    takeOwnership: 'Yo me encargo',
    resolve: 'Marcar resuelto',
    staleTitle: 'Datos CGM posiblemente antiguos',
    staleDetail: 'No confíes en la glucosa actual hasta tener lecturas más recientes.',
    loading: 'Cargando línea de tiempo…',
    empty: 'Sin eventos aún. Steady registrará alertas, lecturas y respuestas aquí.',
    error: 'No se pudo cargar la línea de tiempo.',
    retry: 'Reintentar',
    glucose: 'Glucosa',
    alert: 'Alerta',
    system: 'Sistema',
    event: 'Evento',
  },
  fr: {
    no_responder: 'Pas encore de réponse',
    notified: 'Famille alertée',
    acknowledged: 'Confirmé',
    active_responder: 'Quelqu’un s’en occupe',
    escalated: 'Relais activé',
    resolved: 'Résolu',
    expired: 'Expiré',
    acknowledge: 'Confirmer',
    takeOwnership: 'Je m’en charge',
    resolve: 'Marquer résolu',
    staleTitle: 'Données CGM peut-être anciennes',
    staleDetail: 'Ne vous fiez pas à la glycémie actuelle sans lecture plus récente.',
    loading: 'Chargement…',
    empty: 'Aucun événement pour l’instant.',
    error: 'Impossible de charger la chronologie.',
    retry: 'Réessayer',
    glucose: 'Glycémie',
    alert: 'Alerte',
    system: 'Système',
    event: 'Événement',
  },
  de: {
    no_responder: 'Noch keine Antwort',
    notified: 'Familie benachrichtigt',
    acknowledged: 'Bestätigt',
    active_responder: 'Jemand kümmert sich',
    escalated: 'Reserve aktiv',
    resolved: 'Erledigt',
    expired: 'Abgelaufen',
    acknowledge: 'Bestätigen',
    takeOwnership: 'Ich übernehme',
    resolve: 'Als erledigt markieren',
    staleTitle: 'CGM-Daten möglicherweise veraltet',
    staleDetail: 'Verlasse dich nicht auf den aktuellen Wert ohne frischere Messung.',
    loading: 'Verlauf wird geladen…',
    empty: 'Noch keine Ereignisse.',
    error: 'Verlauf konnte nicht geladen werden.',
    retry: 'Erneut',
    glucose: 'Glukose',
    alert: 'Alarm',
    system: 'System',
    event: 'Ereignis',
  },
  zh: {
    no_responder: '尚未有人响应',
    notified: '已通知家人',
    acknowledged: '已确认',
    active_responder: '有人正在处理',
    escalated: '后备已介入',
    resolved: '已解决',
    expired: '已过期',
    acknowledge: '确认',
    takeOwnership: '我来处理',
    resolve: '标记为已解决',
    staleTitle: 'CGM 数据可能已过期',
    staleDetail: '在获得更新读数前，请勿依赖当前血糖值。',
    loading: '正在加载时间线…',
    empty: '暂无事件。',
    error: '无法加载时间线。',
    retry: '重试',
    glucose: '血糖',
    alert: '警报',
    system: '系统',
    event: '事件',
  },
  ja: {
    no_responder: 'まだ対応者なし',
    notified: '家族に通知済み',
    acknowledged: '確認済み',
    active_responder: '対応中',
    escalated: 'バックアップ介入',
    resolved: '解決済み',
    expired: '期限切れ',
    acknowledge: '確認',
    takeOwnership: '対応します',
    resolve: '解決済みにする',
    staleTitle: 'CGMデータが古い可能性',
    staleDetail: '新しい測定値が来るまで現在値を頼りにしないでください。',
    loading: 'タイムラインを読み込み中…',
    empty: 'まだイベントはありません。',
    error: 'タイムラインを読み込めませんでした。',
    retry: '再試行',
    glucose: 'グルコース',
    alert: 'アラート',
    system: 'システム',
    event: 'イベント',
  },
  pt: {
    no_responder: 'Ainda sem resposta',
    notified: 'Família avisada',
    acknowledged: 'Confirmado',
    active_responder: 'Alguém está cuidando',
    escalated: 'Apoio reserva ativo',
    resolved: 'Resolvido',
    expired: 'Expirado',
    acknowledge: 'Confirmar',
    takeOwnership: 'Estou cuidando',
    resolve: 'Marcar resolvido',
    staleTitle: 'Dados CGM podem estar antigos',
    staleDetail: 'Não confie na glicose atual até chegar uma leitura mais recente.',
    loading: 'Carregando linha…',
    empty: 'Nenhum evento ainda.',
    error: 'Não foi possível carregar a linha.',
    retry: 'Tentar de novo',
    glucose: 'Glicose',
    alert: 'Alerta',
    system: 'Sistema',
    event: 'Evento',
  },
  he: {
    no_responder: 'עדיין אין מגיב',
    notified: 'המשפחה קיבלה התראה',
    acknowledged: 'אושר',
    active_responder: 'מישהו מטפל',
    escalated: 'גיבוי מעורב',
    resolved: 'נפתר',
    expired: 'פג תוקף',
    acknowledge: 'אשר',
    takeOwnership: 'אני מטפל/ת',
    resolve: 'סמן כנפתר',
    staleTitle: 'נתוני CGM אולי לא עדכניים',
    staleDetail: 'אל תסמכו על הערך הנוכחי עד שיגיעו מדידות חדשות.',
    loading: 'טוען ציר זמן…',
    empty: 'אין אירועים עדיין.',
    error: 'לא ניתן לטעון את ציר הזמן.',
    retry: 'נסה שוב',
    glucose: 'גלוקוז',
    alert: 'התראה',
    system: 'מערכת',
    event: 'אירוע',
  },
  ar: {
    no_responder: 'لا يوجد مستجيب بعد',
    notified: 'تم إبلاغ العائلة',
    acknowledged: 'تم التأكيد',
    active_responder: 'هناك من يتولى الأمر',
    escalated: 'الدعم الاحتياطي مشارك',
    resolved: 'تم الحل',
    expired: 'منتهٍ',
    acknowledge: 'تأكيد',
    takeOwnership: 'أنا أتولى الأمر',
    resolve: 'وضع علامة محلول',
    staleTitle: 'بيانات CGM قد تكون قديمة',
    staleDetail: 'لا تعتمد على قراءة الجلوكوز الحالية حتى تصل قراءات أحدث.',
    loading: 'جاري تحميل الخط الزمني…',
    empty: 'لا توجد أحداث بعد.',
    error: 'تعذر تحميل الخط الزمني.',
    retry: 'إعادة المحاولة',
    glucose: 'جلوكوز',
    alert: 'تنبيه',
    system: 'النظام',
    event: 'حدث',
  },
};

const statusTone = (status: string | undefined) => {
  if (status === 'active') return 'bg-amber-100 text-amber-900 dark:bg-amber-500/12 dark:text-amber-200';
  if (status === 'waiting') return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300';
};

const typeLabel = (entry: PatientTimelineEntry, labels: Record<string, string>) => {
  if (entry.type === 'glucose_reading') return labels.glucose;
  if (entry.type === 'system_warning') return labels.system;
  if (entry.type === 'alert') return labels.alert;
  return labels.event;
};

const formatTimestamp = (timestamp: string, lang: Language) => {
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) return timestamp;
  return new Date(parsed).toLocaleString(lang === 'en' ? 'en-US' : lang, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  lang,
  theme,
  isRTL = false,
  user,
  compactCardClass,
  onWorkspaceRefresh,
}) => {
  const copy = WORKSPACE_COPY[lang];
  const labels = RESPONDER_LABELS[lang] || RESPONDER_LABELS.en;
  const [timeline, setTimeline] = useState<PatientTimelinePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const loadTimeline = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await getPatientTimeline('me');
      setTimeline(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setLoading(false);
    }
  }, [labels.error]);

  useEffect(() => {
    void loadTimeline();
  }, [loadTimeline]);

  const activeAlertId = useMemo(
    () => timeline?.entries.find((entry) => entry.type === 'alert' && entry.status === 'active')?.id || null,
    [timeline?.entries],
  );

  const responderState = timeline?.responderState || 'no_responder';
  const canAcknowledge = Boolean(activeAlertId) && ['notified', 'no_responder'].includes(responderState);
  const canTakeOwnership = Boolean(activeAlertId) && responderState !== 'resolved';
  const canResolve = Boolean(activeAlertId) && responderState !== 'resolved';

  const runAction = async (action: 'acknowledge' | 'take-ownership' | 'resolve') => {
    if (!activeAlertId) return;
    setActionBusy(action);
    setError('');
    try {
      if (action === 'acknowledge') await acknowledgeAlert(activeAlertId);
      if (action === 'take-ownership') await takeAlertOwnership(activeAlertId);
      if (action === 'resolve') await resolveAlert(activeAlertId);
      await loadTimeline();
      if (onWorkspaceRefresh) await onWorkspaceRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setActionBusy(null);
    }
  };

  if (loading && !timeline) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>{labels.loading}</span>
      </div>
    );
  }

  if (error && !timeline) {
    return (
      <div className={compactCardClass}>
        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        <button type="button" className={`${t1dBtnSecondary(theme)} mt-3`} onClick={() => void loadTimeline()}>
          {labels.retry}
        </button>
      </div>
    );
  }

  const entries = timeline?.entries || [];
  const stale = timeline?.watchdog?.staleDataFlag;

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      {stale ? (
        <div className={`${compactCardClass} border border-amber-300/60 dark:border-amber-500/30`}>
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{labels.staleTitle}</p>
              <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/90">{labels.staleDetail}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className={compactCardClass}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {labels[responderState] || responderState}
        </p>
        {activeAlertId ? (
          <div className={`mt-4 flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
            {canAcknowledge ? (
              <button
                type="button"
                disabled={Boolean(actionBusy)}
                className={t1dBtnSecondary(theme)}
                onClick={() => void runAction('acknowledge')}
              >
                {labels.acknowledge}
              </button>
            ) : null}
            {canTakeOwnership ? (
              <button
                type="button"
                disabled={Boolean(actionBusy)}
                className={t1dBtnPrimary(theme)}
                onClick={() => void runAction('take-ownership')}
              >
                {labels.takeOwnership}
              </button>
            ) : null}
            {canResolve ? (
              <button
                type="button"
                disabled={Boolean(actionBusy)}
                className={t1dBtnSecondary(theme)}
                onClick={() => void runAction('resolve')}
              >
                {labels.resolve}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}

      {entries.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">{labels.empty}</p>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className={compactCardClass}>
            <div className={`flex flex-wrap items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-[15px] font-black tracking-tight md:text-base">{entry.title}</p>
              <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {typeLabel(entry, labels)}
                </span>
                {entry.status ? (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(entry.status)}`}>
                    {copy.timelineStatus[entry.status as keyof typeof copy.timelineStatus] || entry.status}
                  </span>
                ) : null}
              </div>
            </div>
            {(entry.actor || entry.timestamp) ? (
              <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {[entry.actor, formatTimestamp(entry.timestamp, lang)].filter(Boolean).join(' · ')}
              </p>
            ) : null}
            {entry.detail ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.detail}</p>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};
