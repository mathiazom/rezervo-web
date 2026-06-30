import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import ChainPageFallback from "@/app/[chain]/ChainPageFallback";
import StoreSelectedChain from "@/app/[chain]/storeSelectedChain";
import Chain from "@/components/Chain";
import { CLASS_ID_QUERY_PARAM, ISO_WEEK_QUERY_PARAM } from "@/lib/consts";
import { getAllLocationIds } from "@/lib/helpers/chain";
import {
    fetchActiveChains,
    fetchChain,
    fetchChainPageStaticProps,
    fetchScheduleWeekDTOServer,
} from "@/lib/helpers/fetchers";
import { scheduleQueryKey } from "@/lib/helpers/schedule";

export async function generateStaticParams() {
    return (await fetchActiveChains()).map((chain) => ({
        chain: chain.profile.identifier,
    }));
}

async function ChainPageContent({
    chainIdentifier,
    searchParams,
}: {
    chainIdentifier: string;
    searchParams: PageProps<"/[chain]">["searchParams"];
}) {
    const { [ISO_WEEK_QUERY_PARAM]: rawWeekParam, [CLASS_ID_QUERY_PARAM]: showClassId } = await searchParams;
    const activeChains = await fetchActiveChains();
    if (!activeChains.some((c) => c.profile.identifier === chainIdentifier)) {
        notFound();
    }
    const { chain, weekParam, chainProfiles, activityCategories } = await fetchChain(chainIdentifier).then((c) =>
        fetchChainPageStaticProps(c, Array.isArray(rawWeekParam) ? rawWeekParam[0] : rawWeekParam),
    );

    const allLocationIds = getAllLocationIds(chain);

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: scheduleQueryKey(chain.profile.identifier, weekParam),
        queryFn: () => fetchScheduleWeekDTOServer(chain.profile.identifier, weekParam, allLocationIds),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <StoreSelectedChain chainIdentifier={chain.profile.identifier} />
            <Chain
                weekParam={weekParam}
                showClassId={Array.isArray(showClassId) ? showClassId[0] : showClassId}
                chain={chain}
                chainProfiles={chainProfiles}
                initialLocationIds={allLocationIds}
                activityCategories={activityCategories}
            />
        </HydrationBoundary>
    );
}

export default async function Page({ params, searchParams }: PageProps<"/[chain]">) {
    const chainIdentifier = (await params).chain;
    return (
        <Suspense fallback={<ChainPageFallback />}>
            <ChainPageContent chainIdentifier={chainIdentifier} searchParams={searchParams} />
        </Suspense>
    );
}
