import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import StoreSelectedChain from "@/app/[chain]/storeSelectedChain";
import Chain from "@/components/Chain";
import { CLASS_ID_QUERY_PARAM, ISO_WEEK_QUERY_PARAM } from "@/lib/consts";
import {
    fetchActiveChains,
    fetchChain,
    fetchChainPageStaticProps,
    fetchScheduleWeekDTOServer,
} from "@/lib/helpers/fetchers";
import { scheduleQueryKey } from "@/lib/helpers/schedule";

export const dynamicParams = false;

export const revalidate = 300;

export async function generateStaticParams() {
    return (await fetchActiveChains()).map((chain) => ({
        chain: chain.profile.identifier,
    }));
}

export default async function Page({ params, searchParams }: PageProps<"/[chain]">) {
    const chainIdentifier = (await params).chain;
    const { [ISO_WEEK_QUERY_PARAM]: rawWeekParam, [CLASS_ID_QUERY_PARAM]: showClassId } = await searchParams;
    const { chain, weekParam, chainProfiles, activityCategories } = await fetchChain(chainIdentifier).then((c) =>
        fetchChainPageStaticProps(c, Array.isArray(rawWeekParam) ? rawWeekParam[0] : rawWeekParam),
    );

    const defaultLocationIds = chain.branches.flatMap((branch) => branch.locations.map(({ identifier }) => identifier));

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: scheduleQueryKey(chain.profile.identifier, weekParam),
        queryFn: () => fetchScheduleWeekDTOServer(chain.profile.identifier, weekParam, defaultLocationIds),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <StoreSelectedChain chainIdentifier={chain.profile.identifier} />
            <Chain
                weekParam={weekParam}
                showClassId={Array.isArray(showClassId) ? showClassId[0] : showClassId}
                chain={chain}
                chainProfiles={chainProfiles}
                initialLocationIds={defaultLocationIds}
                activityCategories={activityCategories}
            />
        </HydrationBoundary>
    );
}
