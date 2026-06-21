import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { Features } from "@/types/features";

export function useFeatures() {
    const { isAuthenticated, token } = useUser();

    const { data, error, isLoading } = useQuery<Features, FetchError>({
        queryKey: ["features"],
        queryFn: () => authedFetcher(token ?? "")<Features>("features"),
        enabled: isAuthenticated,
    });

    return {
        features: data,
        featuresError: error,
        featuresLoading: isLoading,
    };
}
