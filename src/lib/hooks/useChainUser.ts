import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { ChainIdentifier } from "@/lib/activeChains";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { fetcher } from "@/lib/utils/fetchUtils";
import { ChainUser, ChainUserPayload } from "@/types/config";

function putChainUser(url: string, { arg: chainUser }: { arg: ChainUserPayload }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(chainUser, null, 2),
    }).then((r) => r.json());
}

export function useChainUser(chain: ChainIdentifier) {
    const { user } = useUser();

    const chainUserApiUrl = `/api/${chain}/user`;

    const { data, error, isLoading } = useSWR<ChainUser>(user && chain ? chainUserApiUrl : null, fetcher);

    const { mutateUserConfig } = useUserConfig(chain);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { trigger, isMutating } = useSWRMutation<ChainUser, any, string, ChainUserPayload>(
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
