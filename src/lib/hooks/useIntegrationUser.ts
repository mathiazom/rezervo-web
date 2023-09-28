import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { IntegrationIdentifier } from "@/lib/providers/active";
import { fetcher } from "@/lib/utils/fetchUtils";
import { IntegrationUser, IntegrationUserPayload } from "@/types/config";

function putIntegrationUser(url: string, { arg: integrationUser }: { arg: IntegrationUserPayload }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(integrationUser, null, 2),
    }).then((r) => r.json());
}

export function useIntegrationUser(integration: IntegrationIdentifier) {
    const { user } = useUser();

    const integrationUserApiUrl = `/api/${integration}/user`;

    const { data, error, isLoading } = useSWR<IntegrationUser>(
        user && integration ? integrationUserApiUrl : null,
        fetcher,
    );

    const { mutateUserConfig } = useUserConfig(integration);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { trigger, isMutating } = useSWRMutation<IntegrationUser, any, string, IntegrationUserPayload>(
        integrationUserApiUrl,
        putIntegrationUser,
        {
            populateCache: true, // use updated data from mutate response
            revalidate: false,
            onSuccess: () => mutateUserConfig(),
        },
    );

    return {
        integrationUser: data,
        integrationUserError: error,
        integrationUserMissing: error && error.status === 404,
        integrationUserLoading: isLoading || isMutating,
        putIntegrationUser: trigger,
        putIntegrationUserIsMutating: isMutating,
    };
}
