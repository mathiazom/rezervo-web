import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { deserializeUserSessions } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { BaseUserSessionDTO } from "@/types/serialization";

export function useUserSessions() {
    const { isAuthenticated } = useUser();

    const userSessionsApiUrl = `user/sessions`;

    const { data, mutate } = useSWR<BaseUserSessionDTO[]>(isAuthenticated ? userSessionsApiUrl : null, fetcher);

    return {
        userSessions: data ? deserializeUserSessions(data) : null,
        mutateUserSessions: mutate,
    };
}
