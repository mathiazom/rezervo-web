import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { put } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";
import { RezervoCommunity, UserRelationship, UserRelationshipAction } from "@/types/community";

function putRelationship(
    url: string,
    token: string,
    { arg: relationship }: { arg: { userId: string; action: UserRelationshipAction } },
) {
    return put(url, {
        body: JSON.stringify(relationship, null, 2),
        accessToken: token,
    }).then((r) => r.json());
}

export function useCommunity() {
    const { isAuthenticated, token } = useUser();

    const communityApiUrl = `community`;
    const relationshipApiUrl = `community/relationship`;

    const { data, error, isLoading, mutate } = useSWR<RezervoCommunity>(
        isAuthenticated ? communityApiUrl : null,
        authedFetcher(token ?? ""),
    );

    const [isMutatingRelationship, setIsMutatingRelationship] = useState(false);

    const { trigger: updateRelationship } = useSWRMutation<
        UserRelationship,
        unknown,
        string | null,
        { userId: string; action: UserRelationshipAction }
    >(
        isAuthenticated ? relationshipApiUrl : null,
        async (url, { arg: relationship }) => {
            if (token == null) return;
            setIsMutatingRelationship(true);
            const res = await putRelationship(url, token, { arg: relationship });
            await mutate();
            setIsMutatingRelationship(false);
            return res;
        },
        {
            revalidate: false,
        },
    );

    return {
        community: data,
        communityError: error,
        communityLoading: isLoading,
        mutateCommunity: mutate,
        updateRelationship: updateRelationship,
        isUpdatingRelationship: isMutatingRelationship,
    };
}
