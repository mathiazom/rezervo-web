import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { fetcher } from "@/lib/utils/fetchUtils";
import { Preferences, PreferencesPayload } from "@/types/config";

function putPreferences(url: string, { arg: preferences }: { arg: PreferencesPayload }) {
    return put(url, { body: JSON.stringify(preferences, null, 2), mode: "client" }).then((r) => r.json());
}

export function usePreferences() {
    const { isAuthenticated } = useUser();

    const preferencesApiUrl = `preferences`;

    const { data, error, isLoading } = useSWR<Preferences>(isAuthenticated ? preferencesApiUrl : null, fetcher);

    const { trigger, isMutating } = useSWRMutation<Preferences, unknown, string, PreferencesPayload>(
        preferencesApiUrl,
        (url: string, { arg: preferences }: { arg: PreferencesPayload }) => {
            return putPreferences(url, { arg: preferences });
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
