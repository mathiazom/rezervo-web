import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";

export function useUserChainConfigs() {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = $api.useQuery("get", "/user/chain-configs", {}, { enabled: isAuthenticated });

    return {
        userChainConfigs: data ?? null,
        userChainConfigsError: error,
        userChainConfigsLoading: isLoading,
        mutateUserChainConfigs: () => queryClient.invalidateQueries({ queryKey: ["get", "/user/chain-configs"] }),
    };
}
