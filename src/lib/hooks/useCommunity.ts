import { useUser } from "@auth0/nextjs-auth0/client";
import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { put } from "@/lib/helpers/requests";
import { fetcher } from "@/lib/utils/fetchUtils";
import { RezervoCommunity, UserRelationship, UserRelationshipAction } from "@/types/community";

function putRelationship(
    url: string,
    { arg: relationship }: { arg: { userId: string; action: UserRelationshipAction } },
) {
    return put(url, {
        body: JSON.stringify(relationship, null, 2),
        mode: "authProxy",
    }).then((r) => r.json());
}

export function useCommunity() {
    const { user } = useUser();

    const communityApiUrl = `community`;
    const relationshipApiUrl = `community/relationship`;

    const { data, error, isLoading, mutate } = useSWR<RezervoCommunity>(user ? communityApiUrl : null, fetcher);

    const [isMutatingRelationship, setIsMutatingRelationship] = useState(false);

    const { trigger: updateRelationship } = useSWRMutation<
        UserRelationship,
        unknown,
        string | null,
        { userId: string; action: UserRelationshipAction }
    >(
        user ? relationshipApiUrl : null,
        async (url, { arg: relationship }) => {
            setIsMutatingRelationship(true);
            const res = await putRelationship(url, { arg: relationship });
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
