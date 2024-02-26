import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { useAllConfigs } from "@/lib/hooks/useAllConfigs";
import { useUserAgenda } from "@/lib/hooks/useUserAgenda";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfigPayload, ChainConfig } from "@/types/config";

async function putConfig(
    url: string,
    { arg: config }: { arg: ChainConfigPayload },
    blockingMutations: () => Promise<unknown[]>,
) {
    const r = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(config, null, 2),
    });
    await blockingMutations();
    return await r.json();
}

export function useUserConfig(chain: ChainIdentifier) {
    const { user } = useUser();

    const configApiUrl = `/api/${chain}/config`;

    const { allConfigsIndex, mutateAllConfigs } = useAllConfigs(chain);
    const { mutateUserAgenda } = useUserAgenda();
    const { mutateUserChainConfigs } = useUserChainConfigs();

    const blockingMutations = async () => Promise.all([mutateUserAgenda(), mutateUserChainConfigs()]);

    const { data, error, isLoading, mutate } = useSWR<ChainConfig>(user && chain ? configApiUrl : null, fetcher);

    const { trigger, isMutating } = useSWRMutation<ChainConfig, unknown, string, ChainConfigPayload>(
        configApiUrl,
        (url: string, { arg: config }: { arg: ChainConfigPayload }) =>
            putConfig(url, { arg: config }, blockingMutations),
        {
            populateCache: true, // use updated data from mutate response
            revalidate: false,
            onSuccess: () => mutateAllConfigs(),
        },
    );

    return {
        userConfig: data,
        userConfigError: !isLoading && !isMutating && error && error.status !== 404 ? error : null,
        userConfigLoading: isLoading || isMutating,
        mutateUserConfig: mutate,
        putUserConfig: trigger,
        allConfigsIndex: allConfigsIndex,
    };
}
