import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainUser, ChainUserPayload } from "@/types/config";

async function putChainUser(
    url: string,
    { arg: chainUser }: { arg: ChainUserPayload },
    dependantMutations: () => Promise<void>,
) {
    const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(chainUser, null, 2),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error("An error occurred while updating chain user");
    }
    await dependantMutations();
    return data;
}

type ChainUserUpdatedResponse = {
    status: "updated";
    profile: ChainUser;
};

type ChainUserTotpFlowInitiatedResponse = {
    status: "initiated_totp_flow";
};

type ChainUserMutationReponse = ChainUserUpdatedResponse | ChainUserTotpFlowInitiatedResponse;

export function useChainUser(chain: ChainIdentifier) {
    const { user } = useUser();

    const chainUserApiUrl = `/api/${chain}/user`;
    const chainUserTotpApiUrl = `/api/${chain}/user/totp`;

    const { data, error, isLoading } = useSWR<ChainUser>(user && chain ? chainUserApiUrl : null, fetcher);

    const { mutateUserConfig } = useUserConfig(chain);
    const { mutateUserChainConfigs } = useUserChainConfigs();
    const dependantMutations = async () => {
        await mutateUserChainConfigs();
    };

    const putChainUserMutation = useSWRMutation<ChainUserMutationReponse, unknown, string, ChainUserPayload>(
        chainUserApiUrl,
        (url: string, { arg: chainUser }: { arg: ChainUserPayload }) =>
            putChainUser(url, { arg: chainUser }, dependantMutations),
        {
            // TODO
            // populateCache: true, // use updated data from mutate response
            // revalidate: false,
            onSuccess: () => mutateUserConfig(),
        },
    );

    const putChainUserTotpMutation = useSWRMutation<unknown, unknown, string, ChainUserPayload>(
        chainUserTotpApiUrl,
        (url: string, { arg: chainUser }: { arg: ChainUserPayload }) =>
            putChainUser(url, { arg: chainUser }, dependantMutations),
        // TODO
        // {
        //     populateCache: true, // use updated data from mutate response
        //     revalidate: false,
        //     onSuccess: () => mutateUserConfig(),
        // },
    );

    return {
        chainUser: data,
        chainUserError: error,
        chainUserMissing: error && error.status === 404,
        chainUserLoading: isLoading || putChainUserMutation.isMutating,
        putChainUser: putChainUserMutation.trigger,
        putChainUserIsMutating: putChainUserMutation.isMutating,
        putChainUserTotp: putChainUserTotpMutation.trigger,
        putChainUserTotpIsMutating: putChainUserTotpMutation.isMutating,
    };
}
