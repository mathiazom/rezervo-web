import type { GetStaticPaths, NextPage } from "next";
import React, { useEffect, useMemo } from "react";
import { Middleware, SWRConfig, useSWRConfig } from "swr";

import Chain from "@/components/Chain";
import PageHead from "@/components/utils/PageHead";
import { fetchActiveChains, fetchChain, fetchChainPageStaticProps } from "@/lib/helpers/fetchers";
import { storeSelectedChain } from "@/lib/helpers/storage";
import { ChainPageParams } from "@/types/chain";
import { ChainPageProps, RezervoWeekScheduleDTO } from "@/types/serialization";

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: (await fetchActiveChains()).map((chain) => ({
            params: {
                chain: chain.profile.identifier,
            },
        })),
        fallback: false,
    };
};

export async function getStaticProps({ params }: { params: ChainPageParams }): Promise<{
    revalidate: number;
    props: ChainPageProps;
}> {
    return fetchChain(params.chain).then(fetchChainPageStaticProps);
}

/**
 * Middleware to reduce cache misses by allowing schedule data from a superset of the requested locations.
 * Classes from excess locations must therefore be filtered out when displayed.
 */
const scheduleFetchMiddleware: Middleware = (useSWRNext) => (key, fetcher, config) => {
    // ignore non-schedule keys
    if (!(typeof key === "string" && key.match(/^[a-z0-9-]+\/schedule/))) {
        return useSWRNext(key, fetcher, config);
    }
    const { cache } = useSWRConfig();
    // quick check for existing keys
    if (cache.get(key) !== undefined) {
        return useSWRNext(key, fetcher, config);
    }
    const [baseUrl, queryParamsRaw] = key.split("?");
    if (baseUrl == undefined || queryParamsRaw == undefined) {
        return useSWRNext(key, fetcher, config);
    }
    const queryParams = new URLSearchParams(queryParamsRaw);
    const compactISOWeek = queryParams.get("w");
    if (compactISOWeek == undefined) {
        return useSWRNext(key, fetcher, config);
    }
    const locationIds = queryParams.getAll("location");
    for (const candidateKey of Array.from(cache.keys())) {
        if (!candidateKey.startsWith(baseUrl)) {
            continue;
        }
        const [, candidateQueryParamsRaw] = candidateKey.split("?");
        if (candidateQueryParamsRaw == undefined) {
            continue;
        }
        const candidateQueryParams = new URLSearchParams(candidateQueryParamsRaw);
        if (candidateQueryParams.get("w") !== compactISOWeek) {
            continue;
        }
        const candidateLocationIds = candidateQueryParams.getAll("location");
        // check if cache value represents a superset of the requested locationIds
        // (possibly returning more data than requested)
        if (locationIds.every((id) => candidateLocationIds.includes(id))) {
            return useSWRNext(candidateKey, fetcher, config);
        }
    }
    return useSWRNext(key, fetcher, config);
};

const SWRCacheInjector = <T,>({ cacheData }: { cacheData: { [_: string]: T } }) => {
    const { mutate } = useSWRConfig();

    useEffect(() => {
        for (const [key, value] of Object.entries(cacheData)) {
            mutate(key, value);
        }
    }, [mutate, cacheData]);

    return null;
};

const ChainPage: NextPage<ChainPageProps> = ({
    chain,
    chainProfiles,
    swrPrefetched,
    activityCategories,
    classPopularityIndex,
    error,
}) => {
    useEffect(() => {
        storeSelectedChain(chain.profile.identifier);
    }, [chain.profile.identifier]);

    const defaultLocationIds = useMemo(() => {
        return chain.branches.flatMap((branch) => branch.locations.map(({ identifier }) => identifier));
    }, [chain.branches]);

    return (
        <SWRConfig
            value={{
                use: [scheduleFetchMiddleware],
            }}
        >
            <PageHead title={`${chain.profile.identifier}-rezervo`} />
            <SWRCacheInjector<RezervoWeekScheduleDTO> cacheData={swrPrefetched} />
            <Chain
                classPopularityIndex={classPopularityIndex}
                chain={chain}
                chainProfiles={chainProfiles}
                initialLocationIds={defaultLocationIds}
                activityCategories={activityCategories}
                error={error}
            />
        </SWRConfig>
    );
};

export default ChainPage;
