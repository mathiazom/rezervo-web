import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";
import { RezervoCommunity, UserRelationship, UserRelationshipAction } from "@/types/community";

export function useCommunity() {
    const { isAuthenticated, token } = useUser();
    const queryClient = useQueryClient();

    const communityApiUrl = `community`;
    const relationshipApiUrl = `community/relationship`;
    const queryKey = [communityApiUrl];

    const { data, error, isLoading } = useQuery<RezervoCommunity, FetchError>({
        queryKey,
        queryFn: () => authedFetcher(token ?? "")<RezervoCommunity>(communityApiUrl),
        enabled: isAuthenticated,
    });

    const { mutateAsync: updateRelationship, isPending: isUpdatingRelationship } = useMutation<
        UserRelationship | undefined,
        FetchError,
        { userId: string; action: UserRelationshipAction }
    >({
        mutationFn: (relationship) => {
            if (token == null) return Promise.resolve(undefined);
            return put(relationshipApiUrl, {
                body: JSON.stringify(relationship, null, 2),
                accessToken: token,
            }).then((r) => r.json());
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    return {
        community: data,
        communityError: error,
        communityLoading: isLoading,
        mutateCommunity: () => queryClient.invalidateQueries({ queryKey }),
        updateRelationship,
        isUpdatingRelationship,
    };
}
