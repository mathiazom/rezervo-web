import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { put } from "@/lib/helpers/requests";
import { fetcher } from "@/lib/utils/fetchUtils";
import { Preferences, PreferencesPayload } from "@/types/config";

function putPreferences(url: string, { arg: preferences }: { arg: PreferencesPayload }) {
    return put(url, { body: JSON.stringify(preferences, null, 2), useAuthProxy: true }).then((r) => r.json());
}

export function usePreferences() {
    const { user } = useUser();

    const preferencesApiUrl = `preferences`;

    const { data, error, isLoading } = useSWR<Preferences>(user ? preferencesApiUrl : null, fetcher);

    const { trigger, isMutating } = useSWRMutation<Preferences, unknown, string, PreferencesPayload>(
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
