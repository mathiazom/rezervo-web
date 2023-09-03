"use strict";

/**
 * Custom listeners to enable receiving of notifications based on
 * https://github.com/shadowwalker/next-pwa/blob/master/examples/web-push/worker/index.js
 */

declare let self: ServiceWorkerGlobalScope;

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

export {};
