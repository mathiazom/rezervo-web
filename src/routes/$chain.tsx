import { createFileRoute, notFound } from "@tanstack/react-router";

import Chain from "@/components/Chain";
import StoreSelectedChain from "@/components/utils/StoreSelectedChain";
import { scheduleQueryKey } from "@/lib/helpers/schedule";
import { getChainPageDataFn } from "@/lib/server/chainData";
import { z } from "zod";

export const Route = createFileRoute("/$chain")({
    validateSearch: z.object({
        w: z.string().optional(),
        c: z.string().optional(),
        now: z.boolean().optional(),
    }),
    loaderDeps: ({ search }) => ({
        w: search.w,
    }),
    loader: async ({ params, deps, context: { queryClient } }) => {
        const data = await getChainPageDataFn({
            data: { chainIdentifier: params.chain, weekParam: deps.w },
        });
        if (data === null) {
            throw notFound();
        }
        queryClient.setQueryData(scheduleQueryKey(data.chain.profile.identifier, data.weekParam), data.scheduleDTO);
        return data;
    },
    component: ChainRoute,
});

function ChainRoute() {
    const { chain, weekParam, chainProfiles, activityCategories, allLocationIds } = Route.useLoaderData();
    return (
        <>
            <StoreSelectedChain chainIdentifier={chain.profile.identifier} />
            <Chain
                weekParam={weekParam}
                chain={chain}
                chainProfiles={chainProfiles}
                initialLocationIds={allLocationIds}
                activityCategories={activityCategories}
            />
        </>
    );
}
