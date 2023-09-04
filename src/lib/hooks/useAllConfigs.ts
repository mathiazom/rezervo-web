import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { AllConfigsIndex, IntegrationIdentifier } from "@/types/rezervo";

export function useAllConfigs(integration: IntegrationIdentifier) {
    const { user } = useUser();

    const allConfigsApiUrl = `/api/${integration}/all-configs`;

    const { data, error, isLoading, mutate } = useSWR<AllConfigsIndex>(
        user && integration ? allConfigsApiUrl : null,
        fetcher,
    );

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: mutate,
    };
}
