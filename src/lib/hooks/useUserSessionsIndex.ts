import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";

export function useUserSessionsIndex(chain: string) {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const sessionsIndexInit = { params: { path: { chain_identifier: chain } } };
    const sessionsIndexKey = $api.queryOptions("get", "/{chain_identifier}/sessions-index", sessionsIndexInit).queryKey;

    const { data, error, isLoading } = $api.useQuery("get", "/{chain_identifier}/sessions-index", sessionsIndexInit, {
        enabled: isAuthenticated && !!chain,
    });

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: () => queryClient.invalidateQueries({ queryKey: sessionsIndexKey }),
    };
}
