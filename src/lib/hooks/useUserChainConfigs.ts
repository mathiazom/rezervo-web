import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfig } from "@/types/config";

export function useUserChainConfigs() {
    const { user } = useUser();

    const userChainConfigsApiUrl = `user/chain-configs`;

    const { data, error, isLoading, mutate } = useSWR<Record<ChainIdentifier, ChainConfig>>(
        user ? userChainConfigsApiUrl : null,
        fetcher,
    );

    return {
        userChainConfigs: data ?? null,
        userChainConfigsError: error,
        userChainConfigsLoading: isLoading,
        mutateUserChainConfigs: mutate,
    };
}
