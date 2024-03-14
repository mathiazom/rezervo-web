import { defaultCache } from "@serwist/next/browser";
import { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope & {
    __SW_MANIFEST: (PrecacheEntry | string)[];
};

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
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList?.[i]?.focused) {
                        client = clientList[i];
                    }
                }
                return client?.focus();
            }
            return self.clients.openWindow("/");
        }),
    );
});

installSerwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
});
