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

// 🔔 PWA Offline Background Notifications & Web Push
self.addEventListener("push", (event) => {
    let payload = { title: "Saathi Companion", body: "You have a reminder waiting!" };
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload.body = event.data.text();
        }
    }
    const options = {
        body: payload.body,
        icon: "/icons/icon-192.svg",
        badge: "/icons/icon-192.svg",
        vibrate: [100, 50, 100],
        data: { url: "/" }
    };
    event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow("/");
            }
        })
    );
});

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SHOW_NOTIFICATION") {
        const { title, body, icon } = event.data;
        self.registration.showNotification(title || "Saathi Companion", {
            body: body || "Habit reminder",
            icon: icon || "/icons/icon-192.svg",
            vibrate: [100, 50, 100]
        });
    }
});

