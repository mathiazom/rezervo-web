import StoreSelectedChain from "@/app/[chain]/storeSelectedChain";
import SWRConfigurator from "@/app/[chain]/SWRConfigurator";
import Chain from "@/components/Chain";
import { CLASS_ID_QUERY_PARAM, ISO_WEEK_QUERY_PARAM, SCROLL_TO_NOW_QUERY_PARAM } from "@/lib/consts";
import { fetchActiveChains, fetchChain, fetchChainPageStaticProps } from "@/lib/helpers/fetchers";

export const dynamicParams = false;

export const revalidate = 300;

export async function generateStaticParams() {
    return (await fetchActiveChains()).map((chain) => ({
        chain: chain.profile.identifier,
    }));
}

export default async function Page({ params, searchParams }: PageProps<"/[chain]">) {
    const chainIdentifier = (await params).chain;
    const {
        [ISO_WEEK_QUERY_PARAM]: rawWeekParam,
        [SCROLL_TO_NOW_QUERY_PARAM]: scrollToNowParam,
        [CLASS_ID_QUERY_PARAM]: showClassId,
    } = await searchParams;
    const { chain, weekParam, chainProfiles, scheduleCache, activityCategories, classPopularityIndex, error } =
        await fetchChain(chainIdentifier).then((c) =>
            fetchChainPageStaticProps(c, Array.isArray(rawWeekParam) ? rawWeekParam[0] : rawWeekParam),
        );

    const defaultLocationIds = chain.branches.flatMap((branch) => branch.locations.map(({ identifier }) => identifier));

    return (
        <SWRConfigurator scheduleCache={scheduleCache}>
            <StoreSelectedChain chainIdentifier={chain.profile.identifier} />
            <Chain
                weekParam={weekParam}
                scrollToNow={scrollToNowParam !== undefined}
                showClassId={Array.isArray(showClassId) ? showClassId[0] : showClassId}
                chain={chain}
                classPopularityIndex={classPopularityIndex ?? {}}
                chainProfiles={chainProfiles}
                initialLocationIds={defaultLocationIds}
                activityCategories={activityCategories}
                error={error}
            />
        </SWRConfigurator>
    );
}
