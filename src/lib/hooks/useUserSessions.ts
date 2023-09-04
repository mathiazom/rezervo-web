import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { IntegrationIdentifier, UserSessionsIndex } from "@/types/rezervo";

export function useUserSessions(integration: IntegrationIdentifier) {
    const { user } = useUser();

    const userSessionsApiUrl = `/api/${integration}/sessions`;

    const { data, error, isLoading, mutate } = useSWR<UserSessionsIndex>(
        user && integration ? userSessionsApiUrl : null,
        fetcher,
    );

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: mutate,
    };
}
