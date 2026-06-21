import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { UserSessionsIndex } from "@/types/userSessions";

export function useUserSessionsIndex(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const userSessionsIndexApiUrl = `${chain}/sessions-index`;
    const queryKey = [userSessionsIndexApiUrl];

    const { data, error, isLoading } = useQuery<UserSessionsIndex, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<UserSessionsIndex>(userSessionsIndexApiUrl),
        enabled: isAuthenticated && !!chain,
    });

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: () => queryClient.invalidateQueries({ queryKey }),
    };
}
