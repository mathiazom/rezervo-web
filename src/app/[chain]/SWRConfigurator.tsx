"use client";

import { PropsWithChildren } from "react";
import { Middleware, SWRConfig, useSWRConfig } from "swr";

import { SWRCacheInjector } from "@/app/[chain]/SWRCacheInjector";
import { RezervoWeekScheduleDTO } from "@/types/serialization";

export default function SWRConfigurator({
    scheduleCache,
    children,
}: { scheduleCache: Record<string, RezervoWeekScheduleDTO> | undefined } & PropsWithChildren) {
    return (
        <SWRConfig
            value={{
                use: [scheduleFetchMiddleware],
            }}
        >
            {scheduleCache && <SWRCacheInjector cacheData={scheduleCache} />}
            {children}
        </SWRConfig>
    );
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
