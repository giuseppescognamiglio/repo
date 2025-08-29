const CACHE = "magic-torneo-v1";

// Metti qui TUTTI i file locali essenziali per l'avvio offline.
// (Se in futuro aggiungi vendor locali, aggiungili in questa lista.)
const ASSETS = [
  "/repo/index.html",
  "/repo/torneo/index.html",
  "/repo/torneo/manifest.webmanifest",
  "/repo/torneo/assets/icons/icon-192.png",
  "/repo/torneo/assets/icons/icon-512.png",
  "/repo/torneo/assets/icons/maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// Cache-first per statici, rete di fallback per il resto (CDN inclusi)
self.addEventListener("fetch", (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((resp) => {
        // Opzionale: metti in cache in runtime solo richieste stesse-origin
        try {
          const url = new URL(req.url);
          if (url.origin === location.origin) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
        } catch (_) {}
        return resp;
      });
    })
  );
});
