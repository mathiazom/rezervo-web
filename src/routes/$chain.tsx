import { createFileRoute, notFound } from "@tanstack/react-router";

import Chain from "@/components/Chain";
import StoreSelectedChain from "@/components/utils/StoreSelectedChain";
import { $api } from "@/lib/api/client";
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
        queryClient.setQueryData(
            $api.queryOptions("get", "/chains/{chain_identifier}", {
                params: { path: { chain_identifier: params.chain } },
            }).queryKey,
            data.chain,
        );
        queryClient.setQueryData($api.queryOptions("get", "/chains", {}).queryKey, data.chains);
        queryClient.setQueryData($api.queryOptions("get", "/categories", {}).queryKey, data.activityCategories);
        queryClient.setQueryData(scheduleQueryKey(data.chain.profile.identifier, data.weekParam), data.scheduleDTO);
        return { weekParam: data.weekParam };
    },
    component: ChainRoute,
});

function ChainRoute() {
    const { chain: chainIdentifier } = Route.useParams();
    const { weekParam } = Route.useLoaderData();
    const { data: chain } = $api.useQuery("get", "/chains/{chain_identifier}", {
        params: { path: { chain_identifier: chainIdentifier } },
    });
    return (
        <>
            <StoreSelectedChain chainIdentifier={chain!.profile.identifier} />
            <Chain weekParam={weekParam} chain={chain!} />
        </>
    );
}
