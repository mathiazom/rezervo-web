import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { fetcher } from "@/lib/utils/fetchUtils";
import { Features } from "@/types/features";

export function useFeatures() {
    const { isAuthenticated } = useUser();

    const featuresApiUrl = `features`;

    const { data, error, isLoading } = useSWR<Features>(isAuthenticated ? featuresApiUrl : null, fetcher);

    return {
        features: data,
        featuresError: error,
        featuresLoading: isLoading,
    };
}
