import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { UserSessionsIndex } from "@/types/userSessions";

export function useUserSessionsIndex(chain: ChainIdentifier) {
    const { isAuthenticated } = useUser();

    const userSessionsIndexApiUrl = `${chain}/sessions-index`;

    const { data, error, isLoading, mutate } = useSWR<UserSessionsIndex>(
        isAuthenticated && chain ? userSessionsIndexApiUrl : null,
        fetcher,
    );

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: mutate,
    };
}
