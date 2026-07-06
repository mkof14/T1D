type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const INSTALL_EVENT = 'steady-pwa-installable';

let deferredPrompt: BeforeInstallPromptEvent | null = null;

const UPDATE_EVENT = 'steady-pwa-update';

let waitingWorker: ServiceWorker | null = null;

export const initPwaInstall = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent(INSTALL_EVENT));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent(INSTALL_EVENT));
  });
};

export const subscribePwaInstall = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(INSTALL_EVENT, listener);
  return () => window.removeEventListener(INSTALL_EVENT, listener);
};

export const canInstallPwa = () => Boolean(deferredPrompt);

export const promptPwaInstall = async () => {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  window.dispatchEvent(new CustomEvent(INSTALL_EVENT));
  return outcome === 'accepted';
};

export const isStandalonePwa = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

export const subscribeSwUpdate = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(UPDATE_EVENT, listener);
  return () => window.removeEventListener(UPDATE_EVENT, listener);
};

export const hasPendingSwUpdate = () => Boolean(waitingWorker);

export const applySwUpdate = async () => {
  if (!waitingWorker) return false;
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  return true;
};

export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
    if ('caches' in window) {
      void caches.keys().then((keys) => {
        keys.forEach((key) => {
          void caches.delete(key);
        });
      });
    }
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const nextWorker = registration.installing;
        if (!nextWorker) return;
        nextWorker.addEventListener('statechange', () => {
          if (nextWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker = nextWorker;
            window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
          }
        });
      });
    }).catch(() => undefined);

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      waitingWorker = null;
      window.location.reload();
    });
  });
};
