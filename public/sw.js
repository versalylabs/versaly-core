// Versaly Core Offline Service Worker
const CACHE_NAME = "versaly-core-offline-v4";

// Only public assets are pre-cached. Signed-in pages are cached as you visit them,
// so a signed-out device never fetches (or stores) protected pages.
const PRECACHE_URLS = [
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/apple-touch-icon.png",
  "/manifest.json",
];

// Install: Pre-cache critical app shell routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache core files; don't fail entire install if an individual dynamic route is missing
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: "reload" })
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                // Ignore precache failure for individual routes in dev
              })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up previous caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Sign-out: drop cached pages so they can't be opened offline afterwards
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_PAGE_CACHE") {
    event.waitUntil(caches.delete(CACHE_NAME));
  }
});

// Fetch: Strategy based on request type
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests from the same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First, fall back to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Never cache redirects (e.g. a signed-out visit bounced to /login)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            !networkResponse.redirected &&
            url.pathname !== "/login"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: Check cache for the exact requested page
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to cached dashboard or workspace
          const dashboardFallback = await caches.match("/dashboard");
          if (dashboardFallback) {
            return dashboardFallback;
          }
          const rootFallback = await caches.match("/");
          if (rootFallback) {
            return rootFallback;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <title>Versaly Core — Offline Mode</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { background: radial-gradient(60% 50% at 85% 10%, rgba(79,91,213,.35), transparent 70%), linear-gradient(160deg, #0c1224, #05060b); color: #e2e8f0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
                  .card { background: linear-gradient(155deg, rgba(255,255,255,.1), rgba(255,255,255,.02)), rgba(14,17,30,.6); backdrop-filter: blur(26px) saturate(180%); -webkit-backdrop-filter: blur(26px) saturate(180%); border: 1px solid rgba(255,255,255,.2); border-radius: 24px; padding: 34px; max-width: 440px; box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 24px 70px -16px rgba(2,3,24,.75); }
                  .logo { width: 72px; height: 72px; border-radius: 20px; margin-bottom: 18px; box-shadow: 0 12px 30px rgba(20,5,74,.5); }
                  h1 { font-size: 20px; margin: 0 0 8px; color: #fff; }
                  p { font-size: 14px; color: #b4bdd6; line-height: 1.6; margin: 0; }
                  .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(251,191,36,.12); color: #fcd34d; font-size: 12px; font-weight: 600; margin-bottom: 16px; border: 1px solid rgba(251,191,36,.3); }
                  a { display: inline-block; margin-top: 20px; padding: 10px 22px; background: linear-gradient(180deg, #5f67e8, #4a52cf); color: #fff; text-decoration: none; border-radius: 12px; font-size: 13px; font-weight: 600; box-shadow: inset 0 1px 0 rgba(255,255,255,.28); }
                </style>
              </head>
              <body>
                <div class="card">
                  <img class="logo" src="/icons/icon-192.png" alt="Versaly" />
                  <div class="badge">⚡ Offline Mode Active</div>
                  <h1>Versaly Core is Running Offline</h1>
                  <p>You are disconnected from the internet. Your data is kept on this device and any changes you make will sync automatically when you are back online.</p>
                  <a href="/dashboard">Open Dashboard</a>
                </div>
              </body>
            </html>`,
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // 2. Next.js Static Assets & Media (JS, CSS, fonts, SVG)
  // Stale-While-Revalidate: Serve cached copy instantly, fetch update in background
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. API requests: Try network, if offline return safe fallback JSON
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            message: "Running in Offline Mode. Actions are preserved locally.",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        );
      })
    );
  }
});
