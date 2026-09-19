// Service Worker mínimo para Poliglot.
// Su única función es cumplir el requisito técnico de Android/Chrome para
// poder instalar la web como aplicación (generar el icono real, no solo
// un acceso directo). Cachea el "cascarón" de la app para que cargue
// más rápido, pero la traducción sigue necesitando conexión a internet.

const CACHE_NAME = "poliglot-cache-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Solo intervenimos en peticiones GET del propio origen (el "cascarón" de la app).
  // Todo lo demás (la API de traducción, voces, etc.) va directo a la red.
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => cached)
      );
    })
  );
});
