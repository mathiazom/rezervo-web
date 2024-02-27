import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { deserializeUserSessions } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { BaseUserSessionDTO } from "@/types/serialization";

export function useUserSessions() {
    const { user } = useUser();

    const userSessionsApiUrl = `/api/user/sessions`;

    const { data, mutate } = useSWR<BaseUserSessionDTO[]>(user ? userSessionsApiUrl : null, fetcher);

    return {
        userSessions: data ? deserializeUserSessions(data) : null,
        mutateUserSessions: mutate,
    };
}
