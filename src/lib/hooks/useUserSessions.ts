import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { deserializeUserSessions } from "@/lib/serialization/deserializers";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { BaseUserSessionDTO } from "@/types/serialization";

export function useUserSessions() {
    const { isAuthenticated, token } = useUser();

    const userSessionsApiUrl = `user/sessions`;

    const { data, mutate } = useSWR<BaseUserSessionDTO[]>(
        isAuthenticated ? userSessionsApiUrl : null,
        authedFetcher(token ?? ""),
    );

    return {
        userSessions: data ? deserializeUserSessions(data) : null,
        mutateUserSessions: mutate,
    };
}
