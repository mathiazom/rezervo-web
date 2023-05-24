import useSWR from "swr";
import { ConfigPayload, UserConfig } from "../types/rezervoTypes";
import { fetcher } from "../utils/fetchUtils";
import { useUser } from "@auth0/nextjs-auth0/client";
import useSWRMutation from "swr/mutation";

function putConfig(url: string, { arg: config }: { arg: ConfigPayload }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(config, null, 2),
    }).then((r) => r.json());
}

export function useUserConfig() {
    const { user } = useUser();

    const configApiUrl = "/api/config";

    const { data, error, isLoading } = useSWR<UserConfig>(user ? configApiUrl : null, fetcher);

    const { trigger, isMutating } = useSWRMutation<UserConfig, any, string, ConfigPayload>(configApiUrl, putConfig, {
        populateCache: true, // use updated data from mutate response
        revalidate: false,
    });

    return {
        userConfig: data,
        userConfigError: error,
        userConfigLoading: isLoading || isMutating,
        putUserConfig: trigger,
    };
}
