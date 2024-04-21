import useSWRMutation from "swr/mutation";

import { destroy, post, put } from "@/lib/helpers/requests";

export function usePushNotificationSubscription() {
    const subscriptionApiUrl = `notifications/push`;
    const subscriptionVerifyApiUrl = `notifications/push/verify`;

    function subscribe(url: string, { arg: subscription }: { arg: PushSubscription }) {
        return put(url, { body: JSON.stringify(subscription, null, 2), mode: "authProxy" }).then((r) => r.json());
    }

    const { trigger: triggerSubscribe, isMutating: isSubscribing } = useSWRMutation<
        PushSubscription,
        unknown,
        string,
        PushSubscription
    >(subscriptionApiUrl, subscribe);

    function unsubscribe(url: string, { arg: subscription }: { arg: PushSubscription }) {
        return destroy(url, { body: JSON.stringify(subscription, null, 2), mode: "authProxy" }).then((r) => r.ok);
    }

    const { trigger: triggerUnsubscribe, isMutating: isUnsubscribing } = useSWRMutation<
        boolean,
        unknown,
        string,
        PushSubscription
    >(subscriptionApiUrl, unsubscribe);

    function verify(url: string, { arg: subscription }: { arg: PushSubscription }) {
        return post(url, { body: JSON.stringify(subscription, null, 2), mode: "authProxy" }).then((r) => r.json());
    }

    const { trigger: triggerVerify } = useSWRMutation<boolean, unknown, string, PushSubscription>(
        subscriptionVerifyApiUrl,
        verify,
    );

    return {
        subscribeToPush: triggerSubscribe,
        unsubscribeFromPush: triggerUnsubscribe,
        isSubscribingToPush: isSubscribing,
        isUnsubscribingFromPush: isUnsubscribing,
        verifySubscription: triggerVerify,
    };
}
