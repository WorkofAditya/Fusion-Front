const ADMIN_STATIC_CACHE = "fusion-admin-static-v1";
const ADMIN_DYNAMIC_CACHE = "fusion-admin-dynamic-v1";

const ADMIN_SHELL = [
  "/admin.html",
  "/admin-manifest.webmanifest",
  "/assets/icons/favicon.svg",
  "/assets/icons/icon-180.svg",
  "/assets/icons/icon-192.svg",
  "/assets/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ADMIN_STATIC_CACHE).then((cache) => cache.addAll(ADMIN_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("fusion-admin-") && ![ADMIN_STATIC_CACHE, ADMIN_DYNAMIC_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (url.origin === self.location.origin || url.origin.includes("onrender.com")) {
          const copy = response.clone();
          caches.open(ADMIN_DYNAMIC_CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
