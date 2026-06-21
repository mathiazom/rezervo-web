import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { Preferences, PreferencesPayload } from "@/types/config";

export function usePreferences() {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const preferencesApiUrl = `preferences`;
    const queryKey = [preferencesApiUrl];

    const { data, error, isLoading } = useQuery<Preferences, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<Preferences>(preferencesApiUrl),
        enabled: isAuthenticated,
    });

    const { mutateAsync, isPending } = useMutation<Preferences, FetchError, PreferencesPayload>({
        mutationFn: (preferences) => {
            if (!token) {
                throw new Error("Not authenticated");
            }
            return put(preferencesApiUrl, {
                body: JSON.stringify(preferences, null, 2),
                mode: "client",
                accessToken: token,
            }).then((r) => r.json());
        },
        onSuccess: (updated) => {
            // use the updated data from the response instead of revalidating
            queryClient.setQueryData(queryKey, updated);
        },
    });

    return {
        preferences: data,
        preferencesError: error,
        preferencesLoading: isLoading || isPending,
        putPreferences: mutateAsync,
    };
}
