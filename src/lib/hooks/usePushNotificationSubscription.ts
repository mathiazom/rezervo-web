import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { destroy, get, post, put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";

export function usePushNotificationSubscription() {
    const { token } = useUser();

    const publicKeyApiUrl = `notifications/push/public-key`;
    const subscriptionApiUrl = `notifications/push`;
    const subscriptionVerifyApiUrl = `notifications/push/verify`;

    const {
        data: publicKey,
        error: publicKeyError,
        isLoading: publicKeyLoading,
    } = useSWR<string>(token ? publicKeyApiUrl : null, async () => {
        if (!token) {
            throw new Error("Not authenticated");
        }
        return await (await get(publicKeyApiUrl, { mode: "client", accessToken: token })).json();
    });

    function subscribe(url: string, token: string, { arg: subscription }: { arg: PushSubscription }) {
        return put(url, { body: JSON.stringify(subscription, null, 2), mode: "client", accessToken: token }).then((r) =>
            r.json(),
        );
    }

    const { trigger: triggerSubscribe, isMutating: isSubscribing } = useSWRMutation<
        PushSubscription,
        unknown,
        string,
        PushSubscription
    >(subscriptionApiUrl, (url: string, { arg: subscription }: { arg: PushSubscription }) => {
        if (!token) {
            throw new Error("Not authenticated");
        }
        return subscribe(url, token, { arg: subscription });
    });

    function unsubscribe(url: string, token: string, { arg: subscription }: { arg: PushSubscription }) {
        return destroy(url, { body: JSON.stringify(subscription, null, 2), mode: "client", accessToken: token }).then(
            (r) => r.ok,
        );
    }

    const { trigger: triggerUnsubscribe, isMutating: isUnsubscribing } = useSWRMutation<
        boolean,
        unknown,
        string,
        PushSubscription
    >(subscriptionApiUrl, (url, { arg: subscription }) => {
        if (!token) {
            throw new Error("Not authenticated");
        }
        return unsubscribe(url, token, { arg: subscription });
    });

    function verify(url: string, token: string, { arg: subscription }: { arg: PushSubscription }) {
        return post(url, { body: JSON.stringify(subscription, null, 2), mode: "client", accessToken: token }).then(
            (r) => r.json(),
        );
    }

    const { trigger: triggerVerify } = useSWRMutation<boolean, unknown, string, PushSubscription>(
        subscriptionVerifyApiUrl,
        (url, { arg: subscription }) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return verify(url, token, { arg: subscription });
        },
    );

    return {
        pushNotificationPublicKey: publicKey,
        pushNotificationPublicKeyError: publicKeyError,
        pushNotificationPublicKeyLoading: publicKeyLoading,
        subscribeToPush: triggerSubscribe,
        unsubscribeFromPush: triggerUnsubscribe,
        isSubscribingToPush: isSubscribing,
        isUnsubscribingFromPush: isUnsubscribing,
        verifySubscription: triggerVerify,
    };
}
