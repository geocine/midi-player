// Service worker: precaches the app shell and runtime-caches songs and
// CDN dependencies so the player keeps working offline.

const CACHE_NAME = 'midi-player-v3';

const SHELL = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/playlist.js',
  'js/player.js',
  'js/controls.js',
  'js/visualizer.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Playlist: network-first so new songs appear as soon as they're added.
  if (url.pathname.endsWith('/data/playlist.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Refresh the app code in the background so an installed PWA does not keep
  // running an old player indefinitely. Large MIDI/CDN/soundfont assets remain
  // cache-first to avoid unnecessary downloads and playback startup work.
  if (url.origin === self.location.origin && !url.pathname.includes('/midi/')) {
    event.respondWith(staleWhileRevalidate(request, event));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('Offline and not cached: ' + request.url);
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  // Cache successful (including opaque CDN) responses for offline use.
  if (response.ok || response.type === 'opaque') {
    cache.put(request, response.clone());
  }
  return response;
}

function staleWhileRevalidate(request, event) {
  const cachePromise = caches.open(CACHE_NAME);
  const refresh = cachePromise.then((cache) =>
    fetch(request).then((response) => {
      if (!response.ok) return response;
      return cache.put(request, response.clone()).then(() => response);
    })
  );

  // Register the background work synchronously while the fetch event is live.
  event.waitUntil(refresh.catch(() => undefined));
  return cachePromise
    .then((cache) => cache.match(request))
    .then((cached) => cached || refresh);
}
