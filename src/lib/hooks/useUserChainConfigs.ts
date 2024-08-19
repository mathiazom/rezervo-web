import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfig } from "@/types/config";

export function useUserChainConfigs() {
    const { isAuthenticated, token } = useUser();

    const userChainConfigsApiUrl = `user/chain-configs`;

    const { data, error, isLoading, mutate } = useSWR<Record<ChainIdentifier, ChainConfig>>(
        isAuthenticated ? userChainConfigsApiUrl : null,
        authedFetcher(token ?? ""),
    );

    return {
        userChainConfigs: data ?? null,
        userChainConfigsError: error,
        userChainConfigsLoading: isLoading,
        mutateUserChainConfigs: mutate,
    };
}
