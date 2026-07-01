import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";

export function useMyUser() {
    const { isAuthenticated } = useUser();

    const { data } = $api.useQuery("put", "/user", {}, { enabled: isAuthenticated });

    return {
        userId: data?.id ?? null,
        userName: data?.name ?? null,
    };
}
