import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { Preferences, PreferencesPayload } from "@/types/config";

function putPreferences(url: string, token: string, { arg: preferences }: { arg: PreferencesPayload }) {
    return put(url, { body: JSON.stringify(preferences, null, 2), mode: "client", accessToken: token }).then((r) =>
        r.json(),
    );
}

export function usePreferences() {
    const { isAuthenticated, token } = useUser();

    const preferencesApiUrl = `preferences`;

    const { data, error, isLoading } = useSWR<Preferences>(
        isAuthenticated ? preferencesApiUrl : null,
        authedFetcher(token ?? ""),
    );

    const { trigger, isMutating } = useSWRMutation<Preferences, unknown, string, PreferencesPayload>(
        preferencesApiUrl,
        (url: string, { arg: preferences }: { arg: PreferencesPayload }) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return putPreferences(url, token, { arg: preferences });
        },
        {
            populateCache: true, // use updated data from mutate response
            revalidate: false,
        },
    );

    return {
        preferences: data,
        preferencesError: error,
        preferencesLoading: isLoading || isMutating,
        putPreferences: trigger,
    };
}
