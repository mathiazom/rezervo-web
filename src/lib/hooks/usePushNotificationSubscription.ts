import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { PushNotificationSubscription } from "@/types/openapi";

const asSubscriptionBody = (subscription: PushSubscription) => subscription as unknown as PushNotificationSubscription;

export function usePushNotificationSubscription() {
    const { isAuthenticated } = useUser();

    const {
        data: publicKey,
        error: publicKeyError,
        isLoading: publicKeyLoading,
    } = $api.useQuery("get", "/notifications/push/public-key", {}, { enabled: isAuthenticated });

    const { mutateAsync: subscribe, isPending: isSubscribing } = $api.useMutation("put", "/notifications/push");
    const { mutateAsync: unsubscribe, isPending: isUnsubscribing } = $api.useMutation("delete", "/notifications/push");
    const { mutateAsync: verify } = $api.useMutation("post", "/notifications/push/verify");

    return {
        pushNotificationPublicKey: publicKey,
        pushNotificationPublicKeyError: publicKeyError,
        pushNotificationPublicKeyLoading: publicKeyLoading,
        subscribeToPush: (subscription: PushSubscription) => subscribe({ body: asSubscriptionBody(subscription) }),
        unsubscribeFromPush: async (subscription: PushSubscription) => {
            await unsubscribe({ body: asSubscriptionBody(subscription) });
            return true;
        },
        isSubscribingToPush: isSubscribing,
        isUnsubscribingFromPush: isUnsubscribing,
        verifySubscription: (subscription: PushSubscription) => verify({ body: asSubscriptionBody(subscription) }),
    };
}
