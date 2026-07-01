import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { ChainIdentifier } from "@/types/chain";

export function useAllConfigs(chain: ChainIdentifier) {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/{chain_identifier}/all-configs",
        { params: { path: { chain_identifier: chain } } },
        { enabled: isAuthenticated && !!chain },
    );

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: () => queryClient.invalidateQueries({ queryKey: ["get", "/{chain_identifier}/all-configs"] }),
    };
}
