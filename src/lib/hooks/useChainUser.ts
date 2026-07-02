import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { ChainUserPayload, ChainUserTotpPayload } from "@/types/openapi";

export function useChainUser(chain: string) {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const chainUserInit = { params: { path: { chain_identifier: chain } } };
    const chainUserKey = $api.queryOptions("get", "/{chain_identifier}/user", chainUserInit).queryKey;

    const {
        data: chainUserData,
        error,
        isLoading,
    } = $api.useQuery("get", "/{chain_identifier}/user", chainUserInit, {
        enabled: isAuthenticated && !!chain,
    });

    const { mutateUserConfig } = useUserConfig(chain);
    const { mutateUserChainConfigs } = useUserChainConfigs();
    const dependantMutations = async () => {
        await queryClient.invalidateQueries({ queryKey: chainUserKey });
        await mutateUserConfig();
        await mutateUserChainConfigs();
    };

    const putChainUserMutation = $api.useMutation("put", "/{chain_identifier}/user", {
        onSuccess: dependantMutations,
    });
    const destroyChainUserMutation = $api.useMutation("delete", "/{chain_identifier}/user", {
        onSuccess: dependantMutations,
    });
    const putChainUserTotpMutation = $api.useMutation("put", "/{chain_identifier}/user/totp", {
        onSuccess: dependantMutations,
    });

    return {
        chainUser: chainUserData,
        chainUserError: error,
        chainUserLoading: isLoading || putChainUserMutation.isPending,
        putChainUser: (chainUser: ChainUserPayload) =>
            putChainUserMutation.mutateAsync({ ...chainUserInit, body: chainUser }),
        destroyChainUser: () => destroyChainUserMutation.mutateAsync(chainUserInit),
        putChainUserIsMutating: putChainUserMutation.isPending,
        putChainUserTotp: (totp: ChainUserTotpPayload) =>
            putChainUserTotpMutation.mutateAsync({ ...chainUserInit, body: totp }),
        putChainUserTotpIsMutating: putChainUserTotpMutation.isPending,
    };
}
