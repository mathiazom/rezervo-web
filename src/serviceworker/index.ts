import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, PrecacheEntry, SerwistGlobalConfig, Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Custom listeners to enable receiving of notifications based on
 * https://github.com/shadowwalker/next-pwa/blob/master/examples/web-push/worker/index.js
 */
self.addEventListener("push", (event) => {
    const data = JSON.parse(event?.data?.text() || "{}");
    event?.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.message,
            icon: "/android-chrome-192x192.png",
        }),
    );
});

self.addEventListener("notificationclick", (event) => {
    event?.notification.close();
    event?.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (const c of clientList) {
                    if (c.focused) {
                        client = c;
                    }
                }
                return client?.focus();
            }
            return self.clients.openWindow("/");
        }),
    );
});

const routesToFilter = ["/api/auth/login", "/api/auth/callback", "/api/auth/logout", "/api/auth/me"];

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST ?? [],
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        {
            matcher({ sameOrigin, url }) {
                return sameOrigin && routesToFilter.includes(url.pathname);
            },
            handler: new NetworkOnly(),
        },
        ...defaultCache,
    ],
});

serwist.addEventListeners();
