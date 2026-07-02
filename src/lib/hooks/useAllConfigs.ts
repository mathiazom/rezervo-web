import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";

export function useAllConfigs(chain: string) {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const allConfigsInit = { params: { path: { chain_identifier: chain } } };
    const allConfigsKey = $api.queryOptions("get", "/{chain_identifier}/all-configs", allConfigsInit).queryKey;

    const { data, error, isLoading } = $api.useQuery("get", "/{chain_identifier}/all-configs", allConfigsInit, {
        enabled: isAuthenticated && !!chain,
    });

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: () => queryClient.invalidateQueries({ queryKey: allConfigsKey }),
    };
}
