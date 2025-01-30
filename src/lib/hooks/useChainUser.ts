import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { destroy, put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { authedFetcher } from "@/lib/utils/fetchUtils";
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

async function putChainUser(
    url: string,
    token: string | null,
    chainUser: ChainUserPayload,
    dependantMutations: () => Promise<void>,
) {
    if (token == null) {
        throw new Error("Not authenticated");
    }
    const res = await put(url, { body: JSON.stringify(chainUser, null, 2), mode: "client", accessToken: token });
    const data = await res.json();
    if (!res.ok) {
        throw new Error("An error occurred while updating chain user");
    }
    await dependantMutations();
    return data;
}

async function destroyChainUser(url: string, token: string | null, dependantMutations: () => Promise<void>) {
    if (token == null) {
        throw new Error("Not authenticated");
    }
    const res = await destroy(url, { mode: "client", accessToken: token });
    const data = await res.json();
    if (!res.ok) {
        throw new Error("An error occurred while destroying chain user");
    }
    await dependantMutations();
    return data;
}

async function putChainUserTotp(
    url: string,
    token: string,
    totp: ChainUserTotpPayload,
    dependantMutations: () => Promise<void>,
) {
    if (token == null) {
        throw new Error("Not authenticated");
    }
    const res = await put(url, { body: JSON.stringify(totp, null, 2), mode: "client", accessToken: token });
    const data = await res.json();
    if (!res.ok) {
        throw new Error("An error occurred while updating chain user TOTP");
    }
    await dependantMutations();
    return data;
}

export function useChainUser(chain: ChainIdentifier) {
    const { isAuthenticated, token } = useUser();

    const chainUserApiUrl = `${chain}/user`;
    const chainUserTotpApiUrl = `${chain}/user/totp`;

    const { data, error, isLoading, mutate } = useSWR<ChainUserProfile>(
        isAuthenticated && chain ? chainUserApiUrl : null,
        authedFetcher(token ?? ""),
    );

    const { mutateUserConfig } = useUserConfig(chain);
    const { mutateUserChainConfigs } = useUserChainConfigs();
    const dependantMutations = async () => {
        await mutate();
        await mutateUserConfig();
        await mutateUserChainConfigs();
    };

    const putChainUserMutation = useSWRMutation<ChainUserMutationResponse, unknown, string, ChainUserPayload>(
        chainUserApiUrl,
        (url: string, { arg: chainUser }: { arg: ChainUserPayload }) =>
            putChainUser(url, token, chainUser, dependantMutations),
    );

    const destroyChainUserMutation = useSWRMutation<ChainUserMutationResponse, unknown, string>(
        chainUserApiUrl,
        (url: string) => destroyChainUser(url, token, dependantMutations),
    );

    const putChainUserTotpMutation = useSWRMutation<unknown, unknown, string, ChainUserTotpPayload>(
        chainUserTotpApiUrl,
        (url: string, { arg: totp }: { arg: ChainUserTotpPayload }) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return putChainUserTotp(url, token, totp, dependantMutations);
        },
    );

    return {
        chainUser: data,
        chainUserError: error,
        chainUserMissing: error && error.status === 404,
        chainUserLoading: isLoading || putChainUserMutation.isMutating,
        putChainUser: putChainUserMutation.trigger,
        destroyChainUser: destroyChainUserMutation.trigger,
        putChainUserIsMutating: putChainUserMutation.isMutating,
        putChainUserTotp: putChainUserTotpMutation.trigger,
        putChainUserTotpIsMutating: putChainUserTotpMutation.isMutating,
    };
}
