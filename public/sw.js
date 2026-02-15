const STATIC_CACHE = 'iron-static-v2';
const DATA_CACHE = 'iron-data-v2';
const APP_SHELL = [
  '/iron-protocol/',
  '/iron-protocol/index.html',
  '/iron-protocol/manifest.json',
  '/iron-protocol/offline.html',
  '/iron-protocol/icons/icon-192.svg',
  '/iron-protocol/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys
      .filter((k) => ![STATIC_CACHE, DATA_CACHE].includes(k))
      .map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  const isStatic = /\.(js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/.test(url.pathname);
  const isData = url.pathname.includes('/assets/') || url.pathname.includes('/data/') || url.pathname.includes('exercise');

  if (isStatic) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isData) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match('/iron-protocol/offline.html')) || Response.error())
    );
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(cacheName);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || new Response('Offline', { status: 503 });
}
