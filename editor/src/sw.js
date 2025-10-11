/*
 * Simple service worker to enable offline caching when used with
 * Vite’s injectManifest strategy.  The full featured service
 * worker from the upstream project has been omitted for brevity.
 */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});