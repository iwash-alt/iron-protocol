// Iron Protocol Service Worker
// Strategy: cache-first for assets, network-first for data

const CACHE_NAME = 'iron-protocol-v1';
const DATA_CACHE_NAME = 'iron-protocol-data-v1';

// App shell resources to pre-cache
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Background sync queue
const SYNC_QUEUE_KEY = 'iron-sync-queue';

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ─── Fetch Strategy ───────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Google Fonts: cache-first (they rarely change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // API / data requests: network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DATA_CACHE_NAME));
    return;
  }

  // App assets (JS, CSS, images, SVGs): cache-first
  if (isAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_NAME).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ─── Cache Strategies ─────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return offline page for navigation, or a simple error response
    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      const offline = await caches.match('/offline.html');
      if (offline) return offline;
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAsset(pathname) {
  return /\.(js|css|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico)(\?.*)?$/.test(pathname);
}

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'iron-sync') {
    event.waitUntil(processBackgroundSync());
  }
});

async function processBackgroundSync() {
  // Read queued requests from all controlled clients
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'SYNC_STARTED' });
  }

  try {
    // Notify clients that sync is complete
    for (const client of clients) {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    }
  } catch (err) {
    for (const client of clients) {
      client.postMessage({ type: 'SYNC_FAILED', error: err.message });
    }
  }
}

// ─── Messages from app ───────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Queue data for background sync
  if (event.data && event.data.type === 'QUEUE_SYNC') {
    // Store sync request for when connectivity returns
    event.waitUntil(
      (async () => {
        try {
          if ('sync' in self.registration) {
            await self.registration.sync.register('iron-sync');
          }
        } catch {
          // Background Sync not supported, data persists in localStorage
        }
      })()
    );
  }
});
