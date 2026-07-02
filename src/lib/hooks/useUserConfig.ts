import { useQuery, useQueryClient } from "@tanstack/react-query";

import { $api, apiClient } from "@/lib/api/client";
import { useAllConfigs } from "@/lib/hooks/useAllConfigs";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { ChainConfigPayload } from "@/types/openapi";
import { useChain } from "@/lib/hooks/useChain";

export function useUserConfig() {
    const chain = useChain();
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const configInit = { params: { path: { chain_identifier: chain.profile.identifier } } };

    const { allConfigsIndex, mutateAllConfigs } = useAllConfigs(chain.profile.identifier);
    const { mutateUserSessions } = useUserSessions();
    const { mutateUserChainConfigs } = useUserChainConfigs();

    const configKey = $api.queryOptions("get", "/{chain_identifier}/config", configInit).queryKey;

    const {
        data: userConfig,
        error,
        isLoading,
    } = useQuery({
        queryKey: configKey,
        queryFn: async () => {
            const { data, response } = await apiClient.GET("/{chain_identifier}/config", configInit);
            if (response.status === 404) return null;
            if (!response.ok || data === undefined) {
                throw new Error(`Failed to fetch user config (${response.status})`);
            }
            return data;
        },
        enabled: isAuthenticated,
    });

    const { mutateAsync, isPending } = $api.useMutation("put", "/{chain_identifier}/config", {
        onSuccess: async (updatedConfig) => {
            // populate the cache with the response instead of revalidating the config itself
            queryClient.setQueryData(configKey, updatedConfig);
            await Promise.all([mutateUserSessions(), mutateUserChainConfigs()]);
            await mutateAllConfigs();
        },
    });

    return {
        userConfig: userConfig,
        userConfigError: !isLoading && !isPending && error ? error : null,
        userConfigLoading: isLoading || isPending,
        mutateUserConfig: () => queryClient.invalidateQueries({ queryKey: configKey }),
        putUserConfig: (config: ChainConfigPayload) => mutateAsync({ ...configInit, body: config }),
        allConfigsIndex: allConfigsIndex,
    };
}
