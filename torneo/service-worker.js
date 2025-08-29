const CACHE = "magic-torneo-v1";
const ASSETS = [
  "./",                     // index.html
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png"
  // se aggiungi librerie locali, aggiungile qui
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((resp) => {
        try {
          const url = new URL(e.request.url);
          // Cachea solo richieste della stessa cartella /torneo/
          if (url.origin === location.origin && url.pathname.startsWith(location.pathname.replace(/service-worker\.js$/, ""))) {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
        } catch (_) {}
        return resp;
      });
    })
  );
});
