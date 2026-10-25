// Versaly Core Offline Service Worker
const CACHE_NAME = "versaly-core-offline-v1";

const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/tasks",
  "/workspace",
  "/calendar",
  "/leads",
  "/projects",
  "/clients",
  "/products",
  "/finance",
  "/finance/invoices",
  "/finance/revenue",
  "/finance/expenses",
  "/settings",
  "/icon.svg",
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
          if (networkResponse && networkResponse.status === 200) {
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
                  body { background: #020617; color: #e2e8f0; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
                  .card { background: #0f172a; border: 1px solid #312e81; border-radius: 16px; padding: 32px; max-width: 440px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
                  h1 { font-size: 20px; margin-bottom: 8px; color: #fff; }
                  p { font-size: 14px; color: #94a3b8; line-height: 1.6; }
                  .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 12px; font-weight: 600; margin-bottom: 16px; border: 1px solid rgba(99, 102, 241, 0.3); }
                  a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 10px; font-size: 13px; font-weight: 600; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="badge">⚡ Offline Mode Active</div>
                  <h1>Versaly Core is Running Offline</h1>
                  <p>You are disconnected from the internet. All your locally saved tasks, leads, calendar events, and client data are preserved on this device.</p>
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
