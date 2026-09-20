import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { brandChainConfig, ChainConfig } from "@/types/openapi";

function brandChainConfigs(
    chainConfigs: Record<string, Parameters<typeof brandChainConfig>[0]>,
): Record<string, ChainConfig> {
    return Object.fromEntries(Object.entries(chainConfigs).map(([chain, config]) => [chain, brandChainConfig(config)]));
}

export function useUserChainConfigs() {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const chainConfigsKey = $api.queryOptions("get", "/user/chain-configs", {}).queryKey;

    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/user/chain-configs",
        {},
        { enabled: isAuthenticated, select: brandChainConfigs },
    );

    return {
        userChainConfigs: data ?? null,
        userChainConfigsError: error,
        userChainConfigsLoading: isLoading,
        mutateUserChainConfigs: () => queryClient.invalidateQueries({ queryKey: chainConfigsKey }),
    };
}
