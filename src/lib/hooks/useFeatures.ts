import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { Features } from "@/types/features";

export function useFeatures() {
    const { isAuthenticated, token } = useUser();

    const featuresApiUrl = `features`;

    const { data, error, isLoading } = useSWR<Features>(
        isAuthenticated ? featuresApiUrl : null,
        authedFetcher(token ?? ""),
    );

    return {
        features: data,
        featuresError: error,
        featuresLoading: isLoading,
    };
}
