const STATIC_CACHE = "fusion-static-v3";
const DYNAMIC_CACHE = "fusion-dynamic-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/product.html",
  "/style.css",
  "/product.css",
  "/script.js",
  "/product.js",
  "/manifest.webmanifest",
  "/assets/icons/icon-192.svg",
  "/assets/icons/icon-512.svg",
  "/assets/icons/icon-180.svg",
  "/assets/icons/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, DYNAMIC_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        });
      })
    );
    return;
  }

  if (url.origin.includes("onrender.com")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
