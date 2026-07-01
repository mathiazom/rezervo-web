import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";
import { UserRelationshipAction } from "@/types/community";

export function useCommunity() {
    const { isAuthenticated } = useUser();
    const queryClient = useQueryClient();

    const communityKey = ["get", "/community"];

    const { data, error, isLoading } = $api.useQuery("get", "/community", {}, { enabled: isAuthenticated });

    const { mutateAsync: updateRelationshipRaw, isPending: isUpdatingRelationship } = $api.useMutation(
        "put",
        "/community/relationship",
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKey }) },
    );

    return {
        community: data,
        communityError: error,
        communityLoading: isLoading,
        updateRelationship: (relationship: { userId: string; action: UserRelationshipAction }) =>
            updateRelationshipRaw({ body: relationship }),
        isUpdatingRelationship,
    };
}
