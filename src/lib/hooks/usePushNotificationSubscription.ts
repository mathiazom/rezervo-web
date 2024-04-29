import useSWRMutation from "swr/mutation";

import { destroy, post, put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";

export function usePushNotificationSubscription() {
    const { token } = useUser();

    const subscriptionApiUrl = `notifications/push`;
    const subscriptionVerifyApiUrl = `notifications/push/verify`;

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
        subscribeToPush: triggerSubscribe,
        unsubscribeFromPush: triggerUnsubscribe,
        isSubscribingToPush: isSubscribing,
        isUnsubscribingFromPush: isUnsubscribing,
        verifySubscription: triggerVerify,
    };
}
