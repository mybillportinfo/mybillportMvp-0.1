const CACHE_NAME = 'mybillport-shell-v1';

// App shell pages to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/app',
  '/login',
  '/add-bill',
  '/offline.html',
];

// Never cache API routes — bill data must always be fresh
function isApiRoute(url) {
  return new URL(url).pathname.startsWith('/api/');
}

// ─── Install: pre-cache the app shell ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS)
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate: clear old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: network-first for API routes, cache-first for shell ──────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // API routes: always go to network; never serve from cache
  if (isApiRoute(request.url)) {
    event.respondWith(fetch(request));
    return;
  }

  // App shell: network-first, fall back to cache, then offline page
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and update cache for successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Navigation requests get the offline page
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});
