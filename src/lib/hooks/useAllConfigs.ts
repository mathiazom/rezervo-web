import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { AllConfigsIndex } from "@/types/config";

export function useAllConfigs(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();

    const allConfigsApiUrl = `${chain}/all-configs`;

    const { data, error, isLoading, mutate } = useSWR<AllConfigsIndex>(
        isAuthenticated && chain ? allConfigsApiUrl : null,
        authedFetcher(token ?? ""),
    );

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: mutate,
    };
}
