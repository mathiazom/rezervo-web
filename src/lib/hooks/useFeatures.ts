import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";

export function useFeatures() {
    const { isAuthenticated } = useUser();

    const { data, error, isLoading } = $api.useQuery("get", "/features", {}, { enabled: isAuthenticated });

    return {
        features: data,
        featuresError: error,
        featuresLoading: isLoading,
    };
}
