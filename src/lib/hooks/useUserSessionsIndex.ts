import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { UserSessionsIndex } from "@/types/userSessions";

export function useUserSessionsIndex(chain: ChainIdentifier) {
    const { user } = useUser();

    const userSessionsIndexApiUrl = `${chain}/sessions-index`;

    const { data, error, isLoading, mutate } = useSWR<UserSessionsIndex>(
        user && chain ? userSessionsIndexApiUrl : null,
        fetcher,
    );

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: mutate,
    };
}
