import { useMutation, useQuery } from "@tanstack/react-query";

import { destroy, get, post, put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { FetchError } from "@/lib/utils/fetchUtils";

export function usePushNotificationSubscription() {
    const { token } = useUser();

    const publicKeyApiUrl = `notifications/push/public-key`;
    const subscriptionApiUrl = `notifications/push`;
    const subscriptionVerifyApiUrl = `notifications/push/verify`;

    const {
        data: publicKey,
        error: publicKeyError,
        isLoading: publicKeyLoading,
    } = useQuery<string, FetchError>({
        queryKey: [publicKeyApiUrl],
        queryFn: async () => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return await (
                await get(publicKeyApiUrl, { mode: "client", accessToken: token, revalidate: 60 * 60 * 24 })
            ).json();
        },
        enabled: !!token,
    });

    const { mutateAsync: subscribeToPush, isPending: isSubscribing } = useMutation<
        PushSubscription,
        FetchError,
        PushSubscription
    >({
        mutationFn: (subscription) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return put(subscriptionApiUrl, {
                body: JSON.stringify(subscription, null, 2),
                mode: "client",
                accessToken: token,
            }).then((r) => r.json());
        },
    });

    const { mutateAsync: unsubscribeFromPush, isPending: isUnsubscribing } = useMutation<
        boolean,
        FetchError,
        PushSubscription
    >({
        mutationFn: (subscription) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return destroy(subscriptionApiUrl, {
                body: JSON.stringify(subscription, null, 2),
                mode: "client",
                accessToken: token,
            }).then((r) => r.ok);
        },
    });

    const { mutateAsync: verifySubscription } = useMutation<boolean, FetchError, PushSubscription>({
        mutationFn: (subscription) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return post(subscriptionVerifyApiUrl, {
                body: JSON.stringify(subscription, null, 2),
                mode: "client",
                accessToken: token,
            }).then((r) => r.json());
        },
    });

    return {
        pushNotificationPublicKey: publicKey,
        pushNotificationPublicKeyError: publicKeyError,
        pushNotificationPublicKeyLoading: publicKeyLoading,
        subscribeToPush,
        unsubscribeFromPush,
        isSubscribingToPush: isSubscribing,
        isUnsubscribingFromPush: isUnsubscribing,
        verifySubscription,
    };
}
