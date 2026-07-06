import { getPushConfig, registerPushSubscription, unregisterPushSubscription } from './api';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
};

export async function getPushStatus() {
  return getPushConfig();
}

export async function enableBrowserPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('push_not_supported');
  }

  const config = await getPushConfig();
  if (!config.enabled || !config.publicKey) {
    throw new Error('push_not_configured');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('push_permission_denied');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    });
  }

  await registerPushSubscription(subscription.toJSON());
  return subscription;
}

export async function disableBrowserPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return { removed: false };
  }

  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = registration ? await registration.pushManager.getSubscription() : null;
  if (!subscription) {
    return { removed: false };
  }

  const endpoint = subscription.endpoint;
  await unregisterPushSubscription(endpoint);
  await subscription.unsubscribe();
  return { removed: true };
}
