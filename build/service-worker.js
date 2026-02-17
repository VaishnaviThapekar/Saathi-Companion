// Dynamic cache version - updates with each deployment
const CACHE_VERSION = new Date().toISOString().split('T')[0];
const CACHE_NAME = `ai-companion-${CACHE_VERSION}`;
const PRECACHE_URLS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/icons/icon-192.svg",
    "/icons/icon-512.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => !key.startsWith("ai-companion-")).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    // Network first for HTML to get latest updates
    if (event.request.mode === "navigate" || event.request.destination === "document") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
        );
        return;
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            }).catch(() => caches.match("/"));
        })
    );
});
