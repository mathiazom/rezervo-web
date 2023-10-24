import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { ChainIdentifier } from "@/lib/activeChains";
import { useAllConfigs } from "@/lib/hooks/useAllConfigs";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainConfigPayload, ChainConfig } from "@/types/config";

function putConfig(url: string, { arg: config }: { arg: ChainConfigPayload }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(config, null, 2),
    }).then((r) => r.json());
}

export function useUserConfig(chain: ChainIdentifier) {
    const { user } = useUser();

    const configApiUrl = `/api/${chain}/config`;

    const { allConfigsIndex, mutateAllConfigs } = useAllConfigs(chain);

    const { data, error, isLoading, mutate } = useSWR<ChainConfig>(user && chain ? configApiUrl : null, fetcher);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { trigger, isMutating } = useSWRMutation<ChainConfig, any, string, ChainConfigPayload>(
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
