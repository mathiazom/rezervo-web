import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";

export function usePushNotificationPublicKey() {
    const { user } = useUser();

    const publicKeyApiUrl = `notifications/push/public-key`;

    const { data, error, isLoading } = useSWR<string>(user ? publicKeyApiUrl : null, fetcher);

    return {
        pushNotificationPublicKey: data,
        pushNotificationPublicKeyError: error,
        pushNotificationPublicKeyLoading: isLoading,
    };
}
