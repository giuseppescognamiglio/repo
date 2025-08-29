const CACHE = "magic-torneo-v2"; // bumpa la versione per forzare aggiornamento

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();               // ← nuovo
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    })()
  );
  self.clients.claim();             // ← nuovo
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((resp) => {
        try {
          const url = new URL(e.request.url);
          // Cache runtime solo all'interno della cartella /torneo/
          const basePath = location.pathname.replace(/service-worker\.js$/, "");
          if (url.origin === location.origin && url.pathname.startsWith(basePath)) {
            caches.open(CACHE).then((c) => c.put(e.request, resp.clone()));
          }
        } catch (_) {}
        return resp;
      });
    })
  );
});
