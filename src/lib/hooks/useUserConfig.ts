import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { useAllConfigs } from "@/lib/hooks/useAllConfigs";
import { IntegrationIdentifier } from "@/lib/providers/active";
import { fetcher } from "@/lib/utils/fetchUtils";
import { IntegrationConfigPayload, IntegrationConfig } from "@/types/config";

function putConfig(url: string, { arg: config }: { arg: IntegrationConfigPayload }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(config, null, 2),
    }).then((r) => r.json());
}

export function useUserConfig(integration: IntegrationIdentifier) {
    const { user } = useUser();

    const configApiUrl = `/api/${integration}/config`;

    const { allConfigsIndex, mutateAllConfigs } = useAllConfigs(integration);

    const { data, error, isLoading, mutate } = useSWR<IntegrationConfig>(
        user && integration ? configApiUrl : null,
        fetcher,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { trigger, isMutating } = useSWRMutation<IntegrationConfig, any, string, IntegrationConfigPayload>(
        configApiUrl,
        putConfig,
        {
            populateCache: true, // use updated data from mutate response
            revalidate: false,
            onSuccess: () => mutateAllConfigs(),
        },
    );

    return {
        userConfig: data,
        userConfigError: !isLoading && !isMutating ? error : null,
        userConfigLoading: isLoading || isMutating,
        userConfigMissing: error && error.status === 404,
        mutateUserConfig: mutate,
        putUserConfig: trigger,
        allConfigsIndex: allConfigsIndex,
    };
}
