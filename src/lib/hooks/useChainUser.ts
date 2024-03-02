import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainUser, ChainUserPayload } from "@/types/config";

async function putChainUser(url: string, { arg: chainUser }: { arg: ChainUserPayload }) {
    const res = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(chainUser, null, 2),
    });
    const data = await res.json();
    if (!res.ok || data?.username == undefined) {
        throw new Error("An error occurred while updating chain user");
    }
    return data;
}

export function useChainUser(chain: ChainIdentifier) {
    const { user } = useUser();

    const chainUserApiUrl = `/api/${chain}/user`;

    const { data, error, isLoading } = useSWR<ChainUser>(user && chain ? chainUserApiUrl : null, fetcher);

    const { mutateUserConfig } = useUserConfig(chain);

    const { trigger, isMutating } = useSWRMutation<ChainUser, unknown, string, ChainUserPayload>(
        chainUserApiUrl,
        putChainUser,
        {
            populateCache: true, // use updated data from mutate response
            revalidate: false,
            onSuccess: () => mutateUserConfig(),
        },
    );

    return {
        chainUser: data,
        chainUserError: error,
        chainUserMissing: error && error.status === 404,
        chainUserLoading: isLoading || isMutating,
        putChainUser: trigger,
        putChainUserIsMutating: isMutating,
    };
}
