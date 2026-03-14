const CACHE_NAME = 'mybillport-shell-v1';

const PRECACHE_URLS = [
  '/',
  '/app',
  '/login',
  '/add-bill',
  '/offline.html',
];

function isApiRoute(url) {
  return new URL(url).pathname.startsWith('/api/');
}

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS)
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: network-first ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (isApiRoute(request.url)) {
    event.respondWith(fetch(request));
    return;
  }
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// ─── Push: show native phone notification ────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = { title: 'MyBillPort', body: 'You have a bill update.', url: '/app', icon: '/icon-192.png', badge: '/icon-192.png' };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: { url: payload.url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
      tag: 'mybillport-notification',
    })
  );
});

// ─── Notification click: open/focus the app ──────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
