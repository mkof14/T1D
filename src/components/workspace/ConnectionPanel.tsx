import React from 'react';
import { Activity, Radio, Wifi, WifiOff } from 'lucide-react';
import type { Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dBtnPrimary, t1dBtnSecondary, t1dSoftLabel } from '../../lib/t1d-ui';
import type { WorkspacePayload } from '../../lib/api';
import { formatGlucose } from '../../lib/glucose-units';
import type { GlucoseUnit } from '../../lib/glucose-units';
import { WorkspaceSectionHeader } from './WorkspaceSectionHeader';

const DEVICE_MODELS = [
  { id: 'g7', label: 'Dexcom G7', hint: 'Newest patch sensor' },
  { id: 'g6', label: 'Dexcom G6', hint: 'Widely used CGM' },
  { id: 'libre', label: 'FreeStyle Libre', hint: 'Flash glucose monitor' },
] as const;

type DeviceModelId = (typeof DEVICE_MODELS)[number]['id'];

const CONNECTION_COPY: Record<Language, {
  connected: string;
  waiting: string;
  offline: string;
  lastReading: string;
  chooseDevice: string;
  connectCta: string;
  disconnectCta: string;
  refreshCta: string;
  statusGood: string;
  statusWatch: string;
  statusProblem: string;
  stepDevice: string;
  stepLink: string;
  stepLive: string;
}> = {
  en: {
    connected: 'Connected',
    waiting: 'Waiting for signal',
    offline: 'Not connected',
    lastReading: 'Last reading',
    chooseDevice: 'Choose your sensor',
    connectCta: 'Connect sensor',
    disconnectCta: 'Disconnect',
    refreshCta: 'Refresh data',
    statusGood: 'Readings are flowing normally.',
    statusWatch: 'Signal is delayed — keep the phone nearby.',
    statusProblem: 'No live data — check the sensor and phone.',
    stepDevice: '1. Pick model',
    stepLink: '2. Link account',
    stepLive: '3. Live readings',
  },
  ru: {
    connected: 'Подключено',
    waiting: 'Ждём сигнал',
    offline: 'Не подключено',
    lastReading: 'Последнее значение',
    chooseDevice: 'Выберите датчик',
    connectCta: 'Подключить датчик',
    disconnectCta: 'Отключить',
    refreshCta: 'Обновить данные',
    statusGood: 'Показания поступают нормально.',
    statusWatch: 'Сигнал задерживается — держите телефон рядом.',
    statusProblem: 'Нет живых данных — проверьте датчик и телефон.',
    stepDevice: '1. Выберите модель',
    stepLink: '2. Свяжите аккаунт',
    stepLive: '3. Живые показания',
  },
  uk: {
    connected: 'Підключено',
    waiting: 'Чекаємо сигнал',
    offline: 'Не підключено',
    lastReading: 'Останнє значення',
    chooseDevice: 'Оберіть датчик',
    connectCta: 'Підключити датчик',
    disconnectCta: 'Відключити',
    refreshCta: 'Оновити дані',
    statusGood: 'Показники надходять нормально.',
    statusWatch: 'Сигнал затримується.',
    statusProblem: 'Немає живих даних.',
    stepDevice: '1. Оберіть модель',
    stepLink: '2. Зв’яжіть акаунт',
    stepLive: '3. Живі показники',
  },
  es: { connected: 'Conectado', waiting: 'Esperando señal', offline: 'Sin conexión', lastReading: 'Última lectura', chooseDevice: 'Elige tu sensor', connectCta: 'Conectar sensor', disconnectCta: 'Desconectar', refreshCta: 'Actualizar', statusGood: 'Las lecturas llegan con normalidad.', statusWatch: 'Señal retrasada.', statusProblem: 'Sin datos en vivo.', stepDevice: '1. Modelo', stepLink: '2. Cuenta', stepLive: '3. Lecturas' },
  fr: { connected: 'Connecté', waiting: 'En attente', offline: 'Non connecté', lastReading: 'Dernière valeur', chooseDevice: 'Choisissez le capteur', connectCta: 'Connecter', disconnectCta: 'Déconnecter', refreshCta: 'Actualiser', statusGood: 'Les données arrivent.', statusWatch: 'Signal retardé.', statusProblem: 'Pas de données live.', stepDevice: '1. Modèle', stepLink: '2. Compte', stepLive: '3. Données' },
  de: { connected: 'Verbunden', waiting: 'Warte auf Signal', offline: 'Nicht verbunden', lastReading: 'Letzter Wert', chooseDevice: 'Sensor wählen', connectCta: 'Sensor verbinden', disconnectCta: 'Trennen', refreshCta: 'Aktualisieren', statusGood: 'Werte kommen normal an.', statusWatch: 'Signal verzögert.', statusProblem: 'Keine Live-Daten.', stepDevice: '1. Modell', stepLink: '2. Konto', stepLive: '3. Live-Werte' },
  zh: { connected: '已连接', waiting: '等待信号', offline: '未连接', lastReading: '最近读数', chooseDevice: '选择传感器', connectCta: '连接传感器', disconnectCta: '断开', refreshCta: '刷新', statusGood: '读数正常。', statusWatch: '信号延迟。', statusProblem: '无实时数据。', stepDevice: '1. 型号', stepLink: '2. 账户', stepLive: '3. 实时' },
  ja: { connected: '接続済み', waiting: '信号待ち', offline: '未接続', lastReading: '最新値', chooseDevice: 'センサーを選択', connectCta: '接続', disconnectCta: '切断', refreshCta: '更新', statusGood: 'データは正常です。', statusWatch: '信号が遅れています。', statusProblem: 'ライブデータがありません。', stepDevice: '1. モデル', stepLink: '2. アカウント', stepLive: '3. ライブ' },
  pt: { connected: 'Conectado', waiting: 'Aguardando sinal', offline: 'Desconectado', lastReading: 'Última leitura', chooseDevice: 'Escolha o sensor', connectCta: 'Conectar', disconnectCta: 'Desconectar', refreshCta: 'Atualizar', statusGood: 'Leituras normais.', statusWatch: 'Sinal atrasado.', statusProblem: 'Sem dados ao vivo.', stepDevice: '1. Modelo', stepLink: '2. Conta', stepLive: '3. Leituras' },
  he: { connected: 'מחובר', waiting: 'ממתין לאות', offline: 'לא מחובר', lastReading: 'קריאה אחרונה', chooseDevice: 'בחרו חיישן', connectCta: 'חברו חיישן', disconnectCta: 'נתק', refreshCta: 'רענון', statusGood: 'הנתונים זורמים.', statusWatch: 'אות מושהה.', statusProblem: 'אין נתונים חיים.', stepDevice: '1. דגם', stepLink: '2. חשבון', stepLive: '3. חי' },
  ar: { connected: 'متصل', waiting: 'بانتظار الإشارة', offline: 'غير متصل', lastReading: 'آخر قراءة', chooseDevice: 'اختر المستشعر', connectCta: 'ربط المستشعر', disconnectCta: 'قطع الاتصال', refreshCta: 'تحديث', statusGood: 'القراءات تصل بشكل طبيعي.', statusWatch: 'الإشارة متأخرة.', statusProblem: 'لا توجد بيانات حية.', stepDevice: '1. الطراز', stepLink: '2. الحساب', stepLive: '3. مباشر' },
};

export type ConnectionPanelProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  deviceStatus: WorkspacePayload['deviceStatus'];
  dexcom: WorkspacePayload['dexcomConnection'];
  glucoseUnit: GlucoseUnit;
  glucoseLabel: string;
  trendLabel: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onPoll: () => Promise<void>;
  busy?: boolean;
};

export const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  lang,
  theme,
  isRTL = false,
  sectionTitle,
  sectionSubtitle,
  deviceStatus,
  dexcom,
  glucoseUnit,
  glucoseLabel,
  trendLabel,
  onConnect,
  onDisconnect,
  onPoll,
  busy = false,
}) => {
  const copy = CONNECTION_COPY[lang];
  const softLabelClass = t1dSoftLabel(theme);
  const [selectedModel, setSelectedModel] = React.useState<DeviceModelId>('g7');

  const linkState = dexcom?.status === 'connected' ? 'connected' : deviceStatus?.status === 'connected' ? 'connected' : deviceStatus?.status === 'delayed' ? 'watch' : 'offline';
  const statusLabel = linkState === 'connected' ? copy.connected : linkState === 'watch' ? copy.waiting : copy.offline;
  const statusMessage = linkState === 'connected' ? copy.statusGood : linkState === 'watch' ? copy.statusWatch : copy.statusProblem;
  const glucoseRaw = dexcom?.latestGlucose ?? null;
  const glucose = Number.isFinite(glucoseRaw) ? formatGlucose(glucoseRaw, glucoseUnit) : '—';

  return (
    <section className={`t1d-workspace-section ${theme === 'dark' ? 't1d-workspace-section--dark' : 't1d-workspace-section--light'} ${isRTL ? 'text-right' : 'text-left'}`}>
      <WorkspaceSectionHeader title={sectionTitle} subtitle={sectionSubtitle} theme={theme} isRTL={isRTL} />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div>
            <p className={softLabelClass}>{copy.chooseDevice}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {DEVICE_MODELS.map((model) => {
                const active = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedModel(model.id)}
                    className={`t1d-device-card ${active ? 't1d-device-card--active' : ''} ${theme === 'dark' ? 't1d-device-card--dark' : 't1d-device-card--light'}`}
                  >
                    <span className="t1d-device-card__icon" aria-hidden="true">
                      <Radio size={20} />
                    </span>
                    <span className="t1d-device-card__label">{model.label}</span>
                    <span className="t1d-device-card__hint">{model.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`t1d-connection-steps ${theme === 'dark' ? 't1d-connection-steps--dark' : 't1d-connection-steps--light'}`}>
            <div className={`t1d-connection-step ${selectedModel ? 't1d-connection-step--done' : ''}`}>
              <span>{copy.stepDevice}</span>
              <strong>{DEVICE_MODELS.find((m) => m.id === selectedModel)?.label}</strong>
            </div>
            <div className={`t1d-connection-step ${linkState !== 'offline' ? 't1d-connection-step--done' : ''}`}>
              <span>{copy.stepLink}</span>
              <strong>{statusLabel}</strong>
            </div>
            <div className={`t1d-connection-step ${linkState === 'connected' ? 't1d-connection-step--done' : ''}`}>
              <span>{copy.stepLive}</span>
              <strong>{linkState === 'connected' ? copy.connected : copy.waiting}</strong>
            </div>
          </div>

          <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {linkState === 'connected' ? (
              <>
                <button type="button" disabled={busy} onClick={() => onPoll()} className={t1dBtnSecondary(theme)}>
                  {copy.refreshCta}
                </button>
                <button type="button" disabled={busy} onClick={() => onDisconnect()} className={t1dBtnSecondary(theme)}>
                  {copy.disconnectCta}
                </button>
              </>
            ) : (
              <button type="button" disabled={busy} onClick={() => onConnect()} className={t1dBtnPrimary(theme)}>
                {copy.connectCta}
              </button>
            )}
          </div>
        </div>

        <div className={`t1d-connection-status ${theme === 'dark' ? 't1d-connection-status--dark' : 't1d-connection-status--light'} ${linkState === 'connected' ? 't1d-connection-status--good' : linkState === 'watch' ? 't1d-connection-status--watch' : 't1d-connection-status--off'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {linkState === 'offline' ? <WifiOff size={22} /> : <Wifi size={22} />}
              <p className="text-lg font-extrabold tracking-tight">{statusLabel}</p>
            </div>
            <span className="t1d-connection-status__pulse" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm leading-relaxed opacity-90">{statusMessage}</p>
          {deviceStatus?.name ? (
            <p className="mt-2 text-sm font-semibold">{deviceStatus.name}</p>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="t1d-connection-status__metric">
              <p className={softLabelClass}>{glucoseLabel}</p>
              <p className="mt-1 text-2xl font-black tracking-tight">{glucose}</p>
            </div>
            <div className="t1d-connection-status__metric">
              <p className={softLabelClass}>{copy.lastReading}</p>
              <p className="mt-1 text-sm font-semibold">{deviceStatus?.lastSync || dexcom?.lastPollAt || '—'}</p>
              {dexcom?.latestTrend ? (
                <p className="mt-1 text-xs font-semibold opacity-80">{trendLabel}</p>
              ) : null}
            </div>
          </div>
          {deviceStatus?.message ? (
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed opacity-85">
              <Activity size={16} className="mt-0.5 shrink-0" />
              {deviceStatus.message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
