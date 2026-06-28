import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfig } from "@/types/config";

export function useUserChainConfigs() {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const queryKey = ["user/chain-configs"];

    const { data, error, isLoading } = useQuery<Record<ChainIdentifier, ChainConfig>, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<Record<ChainIdentifier, ChainConfig>>("user/chain-configs"),
        enabled: isAuthenticated,
    });

    return {
        userChainConfigs: data ?? null,
        userChainConfigsError: error,
        userChainConfigsLoading: isLoading,
        mutateUserChainConfigs: () => queryClient.invalidateQueries({ queryKey }),
    };
}
