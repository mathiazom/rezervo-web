import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { destroy, put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainUser, ChainUserPayload, ChainUserProfile, ChainUserTotpPayload } from "@/types/config";

interface ChainUserUpdatedResponse {
    status: "updated";
    profile: ChainUser;
}

interface ChainUserTotpFlowInitiatedResponse {
    status: "initiated_totp_flow";
    totpRegex: string;
}

type ChainUserMutationResponse = ChainUserUpdatedResponse | ChainUserTotpFlowInitiatedResponse;

export function useChainUser(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const chainUserApiUrl = `${chain}/user`;
    const chainUserTotpApiUrl = `${chain}/user/totp`;
    const queryKey = [chainUserApiUrl];

    const { data, error, isLoading } = useQuery<ChainUserProfile, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<ChainUserProfile>(chainUserApiUrl),
        enabled: isAuthenticated && !!chain,
    });

    const { mutateUserConfig } = useUserConfig(chain);
    const { mutateUserChainConfigs } = useUserChainConfigs();
    const dependantMutations = async () => {
        await queryClient.invalidateQueries({ queryKey });
        await mutateUserConfig();
        await mutateUserChainConfigs();
    };

    const putChainUserMutation = useMutation<ChainUserMutationResponse, FetchError, ChainUserPayload>({
        mutationFn: async (chainUser) => {
            if (token == null) {
                throw new Error("Not authenticated");
            }
            const res = await put(chainUserApiUrl, {
                body: JSON.stringify(chainUser, null, 2),
                mode: "client",
                accessToken: token,
            });
            const responseData = await res.json();
            if (!res.ok) {
                throw new Error("An error occurred while updating chain user");
            }
            return responseData;
        },
        onSuccess: dependantMutations,
    });

    const destroyChainUserMutation = useMutation<ChainUserMutationResponse, FetchError>({
        mutationFn: async () => {
            if (token == null) {
                throw new Error("Not authenticated");
            }
            const res = await destroy(chainUserApiUrl, { mode: "client", accessToken: token });
            const responseData = await res.json();
            if (!res.ok) {
                throw new Error("An error occurred while destroying chain user");
            }
            return responseData;
        },
        onSuccess: dependantMutations,
    });

    const putChainUserTotpMutation = useMutation<unknown, FetchError, ChainUserTotpPayload>({
        mutationFn: async (totp) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            const res = await put(chainUserTotpApiUrl, {
                body: JSON.stringify(totp, null, 2),
                mode: "client",
                accessToken: token,
            });
            const responseData = await res.json();
            if (!res.ok) {
                throw new Error("An error occurred while updating chain user TOTP");
            }
            return responseData;
        },
        onSuccess: dependantMutations,
    });

    return {
        chainUser: data,
        chainUserError: error,
        chainUserMissing: error != null && error.status === 404,
        chainUserLoading: isLoading || putChainUserMutation.isPending,
        putChainUser: putChainUserMutation.mutateAsync,
        destroyChainUser: destroyChainUserMutation.mutateAsync,
        putChainUserIsMutating: putChainUserMutation.isPending,
        putChainUserTotp: putChainUserTotpMutation.mutateAsync,
        putChainUserTotpIsMutating: putChainUserTotpMutation.isPending,
    };
}
