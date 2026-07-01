import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { ChainIdentifier } from "@/types/chain";

export function useUserSessionsIndex(chain: ChainIdentifier) {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/{chain_identifier}/sessions-index",
        { params: { path: { chain_identifier: chain } } },
        { enabled: isAuthenticated && !!chain },
    );

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: () =>
            queryClient.invalidateQueries({ queryKey: ["get", "/{chain_identifier}/sessions-index"] }),
    };
}
