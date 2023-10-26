import useSWRMutation from "swr/mutation";

export function usePushNotificationSubscription() {
    const subscriptionApiUrl = `/api/notifications/push`;
    const subscriptionVerifyApiUrl = `/api/notifications/push/verify`;

    function subscribe(url: string, { arg: subscription }: { arg: PushSubscription }) {
        return fetch(url, {
            method: "PUT",
            body: JSON.stringify(subscription, null, 2),
        }).then((r) => r.json());
    }

    const { trigger: triggerSubscribe, isMutating: isSubscribing } = useSWRMutation<
        PushSubscription,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        string,
        PushSubscription
    >(subscriptionApiUrl, subscribe);

    function unsubscribe(url: string, { arg: subscription }: { arg: PushSubscription }) {
        return fetch(url, {
            method: "DELETE",
            body: JSON.stringify(subscription, null, 2),
        }).then((r) => r.ok);
    }

    const { trigger: triggerUnsubscribe, isMutating: isUnsubscribing } = useSWRMutation<
        boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        string,
        PushSubscription
    >(subscriptionApiUrl, unsubscribe);

    function verify(url: string, { arg: subscription }: { arg: PushSubscription }) {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(subscription, null, 2),
        }).then((r) => r.json());
    }

    const { trigger: triggerVerify } = useSWRMutation<
        boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        string,
        PushSubscription
    >(subscriptionVerifyApiUrl, verify);

    return {
        subscribeToPush: triggerSubscribe,
        unsubscribeFromPush: triggerUnsubscribe,
        isSubscribingToPush: isSubscribing,
        isUnsubscribingFromPush: isUnsubscribing,
        verifySubscription: triggerVerify,
    };
}
