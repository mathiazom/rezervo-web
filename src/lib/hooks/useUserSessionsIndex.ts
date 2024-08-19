import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { UserSessionsIndex } from "@/types/userSessions";

export function useUserSessionsIndex(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();

    const userSessionsIndexApiUrl = `${chain}/sessions-index`;

    const { data, error, isLoading, mutate } = useSWR<UserSessionsIndex>(
        isAuthenticated && chain ? userSessionsIndexApiUrl : null,
        authedFetcher(token ?? ""),
    );

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: mutate,
    };
}
