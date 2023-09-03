import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { useAllConfigs } from "@/hooks/useAllConfigs";
import { IntegrationConfigPayload, IntegrationIdentifier, IntegrationConfig } from "@/types/rezervo";
import { fetcher } from "@/utils/fetchUtils";

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

    const { data, error, isLoading } = useSWR<IntegrationConfig>(user && integration ? configApiUrl : null, fetcher);

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
        userConfigError: error,
        userConfigLoading: isLoading || isMutating,
        putUserConfig: trigger,
        allConfigsIndex: allConfigsIndex,
    };
}
