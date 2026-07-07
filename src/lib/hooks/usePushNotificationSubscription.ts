import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { PushNotificationGrants, PushNotificationSubscription } from "@/types/openapi";

const asSubscriptionBody = (
    subscription: PushSubscription,
    grants?: PushNotificationGrants,
): PushNotificationSubscription => ({
    ...(subscription.toJSON() as unknown as PushNotificationSubscription),
    ...(grants != null ? { grants } : {}),
});

export function usePushNotificationSubscription() {
    const { isAuthenticated } = useUser();

    const {
        data: publicKey,
        error: publicKeyError,
        isLoading: publicKeyLoading,
    } = $api.useQuery("get", "/notifications/push/public-key", {}, { enabled: isAuthenticated });

    const { mutateAsync: subscribe } = $api.useMutation("put", "/notifications/push");
    const { mutateAsync: unsubscribe } = $api.useMutation("delete", "/notifications/push");
    const { mutateAsync: verify } = $api.useMutation("post", "/notifications/push/verify");

    return {
        pushNotificationPublicKey: publicKey,
        pushNotificationPublicKeyError: publicKeyError,
        pushNotificationPublicKeyLoading: publicKeyLoading,
        subscribeToPush: (subscription: PushSubscription, grants: PushNotificationGrants) =>
            subscribe({ body: asSubscriptionBody(subscription, grants) }),
        unsubscribeFromPush: (subscription: PushSubscription) =>
            unsubscribe({ body: asSubscriptionBody(subscription) }),
        verifySubscription: (subscription: PushSubscription): Promise<PushNotificationGrants | null> =>
            verify({ body: asSubscriptionBody(subscription) }) as Promise<PushNotificationGrants | null>,
    };
}
