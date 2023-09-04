import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { fetcher } from "@/lib/utils/fetchUtils";
import { Preferences, PreferencesPayload } from "@/types/rezervo";

function putPreferences(url: string, { arg: preferences }: { arg: PreferencesPayload }) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(preferences, null, 2),
    }).then((r) => r.json());
}

export function usePreferences() {
    const { user } = useUser();

    const preferencesApiUrl = `/api/preferences`;

    const { data, error, isLoading } = useSWR<Preferences>(user ? preferencesApiUrl : null, fetcher);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { trigger, isMutating } = useSWRMutation<Preferences, any, string, PreferencesPayload>(
        preferencesApiUrl,
        putPreferences,
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
