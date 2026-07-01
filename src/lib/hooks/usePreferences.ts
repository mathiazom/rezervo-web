import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { PreferencesPayload } from "@/types/config";

export function usePreferences() {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const { data, error, isLoading } = $api.useQuery("get", "/preferences", {}, { enabled: isAuthenticated });

    const preferencesKey = $api.queryOptions("get", "/preferences", {}).queryKey;
    const { mutateAsync, isPending } = $api.useMutation("put", "/preferences", {
        // use the updated data from the response instead of revalidating
        onSuccess: (updated) => queryClient.setQueryData(preferencesKey, updated),
    });

    return {
        preferences: data,
        preferencesError: error,
        preferencesLoading: isLoading || isPending,
        putPreferences: (preferences: PreferencesPayload) => mutateAsync({ body: preferences }),
    };
}
