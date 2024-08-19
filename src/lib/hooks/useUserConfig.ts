import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { put } from "@/lib/helpers/requests";
import { useAllConfigs } from "@/lib/hooks/useAllConfigs";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfigPayload, ChainConfig } from "@/types/config";

async function putConfig(
    url: string,
    token: string,
    { arg: config }: { arg: ChainConfigPayload },
    dependantMutations: () => Promise<unknown[]>,
) {
    const r = await put(url, { body: JSON.stringify(config, null, 2), mode: "client", accessToken: token });
    await dependantMutations();
    return await r.json();
}

export function useUserConfig(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();

    const configApiUrl = `${chain}/config`;

    const { allConfigsIndex, mutateAllConfigs } = useAllConfigs(chain);
    const { mutateUserSessions } = useUserSessions();
    const { mutateUserChainConfigs } = useUserChainConfigs();

    const dependantMutations = async () => Promise.all([mutateUserSessions(), mutateUserChainConfigs()]);

    const { data, error, isLoading, mutate } = useSWR<ChainConfig>(
        isAuthenticated && chain ? configApiUrl : null,
        authedFetcher(token ?? ""),
    );

    const { trigger, isMutating } = useSWRMutation<ChainConfig, unknown, string, ChainConfigPayload>(
        configApiUrl,
        (url: string, { arg: config }: { arg: ChainConfigPayload }) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return putConfig(url, token, { arg: config }, dependantMutations);
        },
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
