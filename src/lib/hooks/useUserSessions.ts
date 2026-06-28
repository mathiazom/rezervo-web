import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/lib/hooks/useUser";
import { deserializeUserSessions } from "@/lib/serialization/deserializers";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { BaseUserSessionDTO } from "@/types/serialization";

export function useUserSessions() {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const queryKey = ["user/sessions"];

    const { data } = useQuery<BaseUserSessionDTO[], FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<BaseUserSessionDTO[]>("user/sessions"),
        enabled: isAuthenticated,
    });

    return {
        userSessions: data ? deserializeUserSessions(data) : null,
        mutateUserSessions: () => queryClient.invalidateQueries({ queryKey }),
    };
}
