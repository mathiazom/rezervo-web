import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { deserializeUserSessions } from "@/lib/serialization/deserializers";

export function useUserSessions() {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const { data } = $api.useQuery(
        "get",
        "/user/sessions",
        {},
        { enabled: isAuthenticated, select: deserializeUserSessions },
    );

    return {
        userSessions: data ?? null,
        mutateUserSessions: () => queryClient.invalidateQueries({ queryKey: ["get", "/user/sessions"] }),
    };
}
