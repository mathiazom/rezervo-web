import useSWRMutation from "swr/mutation";

function subscribe(url: string, { arg: subscription }: { arg: PushSubscription }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(subscription, null, 2),
    }).then((r) => r.json());
}

function unsubscribe(url: string, { arg: subscription }: { arg: PushSubscription }) {
    return fetch(url, {
        method: "DELETE",
        body: JSON.stringify(subscription, null, 2),
    }).then((r) => r.ok);
}

function verify(url: string, { arg: subscription }: { arg: PushSubscription }) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(subscription, null, 2),
    }).then((r) => r.json());
}

export function usePushNotificationSubscription() {
    const subscriptionApiUrl = `/api/notifications/push`;
    const subscriptionVerifyApiUrl = `/api/notifications/push/verify`;

    const { trigger: triggerSubscribe, isMutating: isSubscribing } = useSWRMutation<
        PushSubscription,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        string,
        PushSubscription
    >(subscriptionApiUrl, subscribe);

    const { trigger: triggerUnsubscribe, isMutating: isUnsubscribing } = useSWRMutation<
        boolean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        string,
        PushSubscription
    >(subscriptionApiUrl, unsubscribe);

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
