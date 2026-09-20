import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { UserId } from "@/types/brand";
import { brandCommunityUser, UserRelationshipAction } from "@/types/openapi";

export function useCommunity() {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const communityKey = $api.queryOptions("get", "/community", {}).queryKey;

    const { data, error, isLoading } = $api.useQuery(
        "get",
        "/community",
        {},
        {
            enabled: isAuthenticated,
            select: (community) => ({ ...community, users: community.users.map(brandCommunityUser) }),
        },
    );

    const { mutateAsync: updateRelationshipRaw, isPending: isUpdatingRelationship } = $api.useMutation(
        "put",
        "/community/relationship",
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKey }) },
    );

    return {
        community: data,
        communityError: error,
        communityLoading: isLoading,
        updateRelationship: (relationship: { userId: UserId; action: UserRelationshipAction }) =>
            updateRelationshipRaw({ body: relationship }),
        isUpdatingRelationship,
    };
}
