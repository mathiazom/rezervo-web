import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { AllConfigsIndex } from "@/types/config";

export function useAllConfigs(chain: ChainIdentifier) {
    const { isAuthenticated } = useUser();

    const allConfigsApiUrl = `${chain}/all-configs`;

    const { data, error, isLoading, mutate } = useSWR<AllConfigsIndex>(
        isAuthenticated && chain ? allConfigsApiUrl : null,
        fetcher,
    );

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: mutate,
    };
}
