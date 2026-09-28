/**
 * Universal PWA Service Worker
 * Version: universal-pwa-v1
 * Suitable for GitHub Pages and standalone PWA APK generation via PWABuilder
 */

const CACHE_NAME = 'universal-pwa-v1';

// App shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './pwa-icons/icon-192x192.png',
  './pwa-icons/icon-512x512.png',
  './pwa-icons/maskable-512x512.png'
];

// 1. Install event: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll with graceful failure for individual non-critical files
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate event: Clean up previous cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event:
// - Network-first for HTML / navigation requests
// - Cache-first for same-origin static assets
// - Pure passthrough for external APIs and non-GET requests
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Never intercept non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Cross-origin check:
  // Never cache external API requests (e.g. Gemini, OpenAI, Firebase, CDNs with dynamic data)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML documents) -> Network-First
  const isNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: try cache for the specific URL, then index.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const indexFallback = await caches.match('./index.html') || await caches.match('./');
          if (indexFallback) {
            return indexFallback;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // Static same-origin assets (JS, CSS, images, JSON, fonts) -> Cache-First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately, update in background if online (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Ignore background update failure while offline
          });
        return cachedResponse;
      }

      // Not in cache: fetch from network and store in cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
    })
  );
});
