import useSWR from "swr";
import { UserSessionsIndex } from "../types/rezervoTypes";
import { fetcher } from "../utils/fetchUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

export function useUserSessions() {
    const { user } = useUser();

    const userSessionsApiUrl = "/api/sessions";

    const { data, error, isLoading, mutate } = useSWR<UserSessionsIndex>(user ? userSessionsApiUrl : null, fetcher);

    return {
        userSessionsIndex: data,
        userSessionsIndexError: error,
        userSessionsIndexLoading: isLoading,
        mutateSessionsIndex: mutate,
    };
}
