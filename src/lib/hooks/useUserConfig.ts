import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { put } from "@/lib/helpers/requests";
import { useAllConfigs } from "@/lib/hooks/useAllConfigs";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfig, ChainConfigPayload } from "@/types/config";

export function useUserConfig(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const configApiUrl = `${chain}/config`;
    const queryKey = [configApiUrl];

    const { allConfigsIndex, mutateAllConfigs } = useAllConfigs(chain);
    const { mutateUserSessions } = useUserSessions();
    const { mutateUserChainConfigs } = useUserChainConfigs();

    const { data, error, isLoading } = useQuery<ChainConfig, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<ChainConfig>(configApiUrl),
        enabled: isAuthenticated && !!chain,
    });

    const { mutateAsync, isPending } = useMutation<ChainConfig, FetchError, ChainConfigPayload>({
        mutationFn: (config) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return put(configApiUrl, {
                body: JSON.stringify(config, null, 2),
                mode: "client",
                accessToken: token,
            }).then((r) => r.json());
        },
        onSuccess: async (updatedConfig) => {
            // populate the cache with the response instead of revalidating the config itself
            queryClient.setQueryData(queryKey, updatedConfig);
            await Promise.all([mutateUserSessions(), mutateUserChainConfigs()]);
            await mutateAllConfigs();
        },
    });

    return {
        userConfig: data,
        userConfigError: !isLoading && !isPending && error && error.status !== 404 ? error : null,
        userConfigLoading: isLoading || isPending,
        mutateUserConfig: () => queryClient.invalidateQueries({ queryKey }),
        putUserConfig: mutateAsync,
        allConfigsIndex: allConfigsIndex,
    };
}
