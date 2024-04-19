import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { Features } from "@/types/features";

export function useFeatures() {
    const { user } = useUser();

    const featuresApiUrl = `features`;

    const { data, error, isLoading } = useSWR<Features>(user ? featuresApiUrl : null, fetcher);

    return {
        features: data,
        featuresError: error,
        featuresLoading: isLoading,
    };
}
