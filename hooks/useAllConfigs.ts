import useSWR from "swr";
import { AllConfigsIndex } from "../types/rezervo";
import { fetcher } from "../utils/fetchUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

export function useAllConfigs() {
    const { user } = useUser();

    const allConfigsApiUrl = "/api/all_configs";

    const { data, error, isLoading, mutate } = useSWR<AllConfigsIndex>(user ? allConfigsApiUrl : null, fetcher);

    return {
        allConfigsIndex: data,
        allConfigsError: error,
        allConfigsLoading: isLoading,
        mutateAllConfigs: mutate,
    };
}
