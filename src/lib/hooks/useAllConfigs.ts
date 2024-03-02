import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { AllConfigsIndex } from "@/types/config";

export function useAllConfigs(chain: ChainIdentifier) {
    const { user } = useUser();

    const allConfigsApiUrl = `/api/${chain}/all-configs`;

    const { data, error, isLoading, mutate } = useSWR<AllConfigsIndex>(
        user && chain ? allConfigsApiUrl : null,
        fetcher,
    );

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: mutate,
    };
}
