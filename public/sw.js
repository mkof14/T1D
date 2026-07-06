self.addEventListener('push', (event) => {
  let payload = { title: 'Steady alert', body: 'Open the app to respond.' };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // Keep default payload when push body is not JSON.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Steady alert', {
      body: payload.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: payload,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.includes('/workspace'));
      if (existing) {
        return existing.focus();
      }
      return self.clients.openWindow('/workspace');
    }),
  );
});
