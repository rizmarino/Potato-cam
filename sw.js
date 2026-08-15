// Bump this version string any time you update potato-cam-2.html, manifest.json,
// or the icons — it forces the service worker to fetch fresh copies and re-cache.
const CACHE_NAME = 'potato-cam-v9';

// IMPORTANT: these must exactly match the filenames actually deployed in your repo.
// If you rename the html file again, update the entry below to match.
const CACHE_ASSETS = [
  './potato-cam-2.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Cache-first: serve instantly from cache when available (works fully offline),
// and quietly refresh the cache in the background when a network connection exists.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline and not cached yet — nothing more we can do

      return cached || networkFetch;
    })
  );
});
