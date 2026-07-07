import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { usePushNotificationSubscription } from "@/lib/hooks/usePushNotificationSubscription";
import { base64ToUint8Array } from "@/lib/utils/base64Utils";
import { PushNotificationGrants } from "@/types/openapi";

const SUBSCRIPTION_EXPIRY_MARGIN_MS = 5 * 60 * 1000;
const NO_GRANTS: PushNotificationGrants = { booking: false, community: false, reminder: false };

const anyGrant = (grants: PushNotificationGrants) => grants.booking || grants.community || grants.reminder;

interface PushSubscriptionContextValue {
    grants: PushNotificationGrants;
    isLoading: boolean;
    isSupported: boolean;
    setGrants: (next: PushNotificationGrants) => Promise<void>;
}

const PushSubscriptionContext = createContext<PushSubscriptionContextValue | null>(null);

export function PushSubscriptionProvider({ children }: { children: ReactNode }) {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [grants, setGrantsState] = useState<PushNotificationGrants>(NO_GRANTS);
    const [isLoading, setIsLoading] = useState(true);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const {
        pushNotificationPublicKey,
        pushNotificationPublicKeyError,
        pushNotificationPublicKeyLoading,
        subscribeToPush,
        unsubscribeFromPush,
        verifySubscription,
    } = usePushNotificationSubscription();

    // Degrade to "unsupported" rather than crashing the page when the key can't be resolved.
    const publicKeyUnavailable =
        pushNotificationPublicKeyError != null ||
        (pushNotificationPublicKey == null && !pushNotificationPublicKeyLoading);

    useEffect(() => {
        if (navigator.serviceWorker === undefined) {
            setIsLoading(false);
            return;
        }
        void navigator.serviceWorker.ready.then((reg) => {
            setRegistration(reg);
            if (!reg.pushManager) {
                setIsLoading(false);
                return;
            }
            setIsSupported(true);
            void reg.pushManager.getSubscription().then((sub) => {
                if (!sub || (sub.expirationTime && Date.now() > sub.expirationTime - SUBSCRIPTION_EXPIRY_MARGIN_MS)) {
                    setIsLoading(false);
                    return;
                }
                void verifySubscription(sub).then((storedGrants) => {
                    if (storedGrants !== null) {
                        setSubscription(sub);
                        setGrantsState(storedGrants);
                    }
                    setIsLoading(false);
                });
            });
        });
    }, [verifySubscription]);

    // Toggling a category is not expected to fail, so apply it optimistically (no loading state) and
    // reconcile with the server in the background, rolling back only on the rare error.
    const setGrants = async (next: PushNotificationGrants) => {
        if (registration === null || pushNotificationPublicKey == null) {
            return;
        }
        const previous = grants;
        setGrantsState(next);
        try {
            if (!anyGrant(next)) {
                if (subscription !== null) {
                    await unsubscribeFromPush(subscription);
                    await subscription.unsubscribe();
                    setSubscription(null);
                }
                return;
            }
            let sub = subscription;
            if (sub === null) {
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: base64ToUint8Array(pushNotificationPublicKey),
                });
                setSubscription(sub);
            }
            await subscribeToPush(sub, next);
        } catch {
            setGrantsState(previous);
        }
    };

    const value: PushSubscriptionContextValue = {
        grants,
        isLoading,
        isSupported: isSupported && !publicKeyUnavailable,
        setGrants,
    };

    return <PushSubscriptionContext.Provider value={value}>{children}</PushSubscriptionContext.Provider>;
}

export function usePushSubscription() {
    const context = useContext(PushSubscriptionContext);
    if (context === null) {
        throw new Error("usePushSubscription must be used within a PushSubscriptionProvider");
    }
    return context;
}
