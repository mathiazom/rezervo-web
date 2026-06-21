import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { AllConfigsIndex } from "@/types/config";

export function useAllConfigs(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const allConfigsApiUrl = `${chain}/all-configs`;
    const queryKey = [allConfigsApiUrl];

    const { data, error, isLoading } = useQuery<AllConfigsIndex, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<AllConfigsIndex>(allConfigsApiUrl),
        enabled: isAuthenticated && !!chain,
    });

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: () => queryClient.invalidateQueries({ queryKey }),
    };
}
