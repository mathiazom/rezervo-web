import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";
import { RezervoCommunity } from "@/types/community";

export function useCommunity() {
    const { user } = useUser();

    const communityApiUrl = `/api/community`;

    const { data, error, isLoading, mutate } = useSWR<RezervoCommunity>(user ? communityApiUrl : null, fetcher);

    return {
        community: data,
        communityError: error,
        communityLoading: isLoading,
        mutateCommunity: mutate,
    };
}
