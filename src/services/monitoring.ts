declare global {
  interface Window {
    __T1D_MONITORING__?: {
      captureMessage: (message: string) => void;
      captureException: (error: unknown) => void;
    };
    Sentry?: {
      init: (options: Record<string, unknown>) => void;
      captureException: (error: unknown) => void;
      captureMessage: (message: string) => void;
    };
  }
}

const dsn = import.meta.env.VITE_SENTRY_DSN || '';

const loadSentry = () =>
  new Promise<void>((resolve) => {
    if (!dsn || typeof window === 'undefined' || window.Sentry) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://browser.sentry-cdn.com/8.55.0/bundle.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

export const initMonitoring = async () => {
  if (typeof window === 'undefined') return;

  await loadSentry();

  if (dsn && window.Sentry) {
    window.Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: `steady@${import.meta.env.VITE_APP_VERSION || '1.1.0'}`,
      tracesSampleRate: 0.1,
    });
  }

  window.__T1D_MONITORING__ = {
    captureMessage: (message: string) => {
      window.Sentry?.captureMessage(message);
      console.info('[t1d-monitor]', message);
    },
    captureException: (error: unknown) => {
      window.Sentry?.captureException(error);
      console.error('[t1d-monitor]', error);
    },
  };
};

export const captureMonitoringMessage = (message: string) => {
  window.__T1D_MONITORING__?.captureMessage(message);
};

export const captureMonitoringException = (error: unknown) => {
  window.__T1D_MONITORING__?.captureException(error);
};
