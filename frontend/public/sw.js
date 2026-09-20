// Service worker: keeps the app itself (HTML + JS/CSS) available offline so stage view opens with no signal.
// Song and setlist data are not cached here; the "Save for offline" button stores those inside the app.
// Bump CACHE to force clients to drop old files.
const CACHE = 'ms-shell-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        const html = await (await fetch('/index.html', { cache: 'no-store' })).text();
        // Vite emits hashed /assets files; read them from the HTML so the first visit is fully cached.
        const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
        await cache.addAll(['/index.html', ...assets]);
      } catch {
        /* precache is best-effort; runtime caching below still fills in */
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) if (name !== CACHE) await caches.delete(name);
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Only same-origin GETs. API calls go to another origin (Render) and are never touched here.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network first so new deploys show up; fall back to the cached app shell when offline.
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) (await caches.open(CACHE)).put('/index.html', response.clone());
          return response;
        } catch {
          return (await caches.match('/index.html')) || Response.error();
        }
      })()
    );
  } else if (url.pathname.startsWith('/assets/')) {
    // Hashed file names never change content, so cache-first is safe.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
  }
});
