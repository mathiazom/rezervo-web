import { createServerFn } from "@tanstack/react-start";

import { serverApiClient } from "@/lib/api/client";
import { getAllLocationIds } from "@/lib/helpers/chain";
import {
    compactISOWeekString,
    firstDateOfWeekByOffset,
    fromCompactISOWeekString,
    LocalizedDateTime,
} from "@/lib/helpers/date";
import { ChainId, LocationId, brandChainId } from "@/types/brand";
import { brandRezervoChain, brandRezervoWeekScheduleDTO } from "@/types/openapi";

function resolveWeekParam(rawWeekParam: string | undefined): string {
    let referenceDateTime = rawWeekParam ? fromCompactISOWeekString(rawWeekParam) : null;
    if (!referenceDateTime || !referenceDateTime.isValid) referenceDateTime = LocalizedDateTime.now();
    return compactISOWeekString(firstDateOfWeekByOffset(referenceDateTime, 0));
}

async function fetchScheduleWeekDTO(chainIdentifier: ChainId, weekParam: string, locationIds: LocationId[]) {
    const { data } = await serverApiClient.GET("/schedule/{chain_identifier}/{compact_iso_week}", {
        params: {
            path: { chain_identifier: chainIdentifier, compact_iso_week: weekParam },
            query: { location: locationIds },
        },
    });
    if (!data) {
        throw new Error(`Failed to fetch schedule for chain "${chainIdentifier}", week ${weekParam}`);
    }
    // The backend response does not include the requested locationIds, so inject them for deserialization.
    return brandRezervoWeekScheduleDTO(data, locationIds);
}

export const getChainPageDataFn = createServerFn({ method: "GET" })
    .validator((data: { chainIdentifier: string; weekParam: string | undefined }) => data)
    .handler(async ({ data: { chainIdentifier: rawChainIdentifier, weekParam: rawWeekParam } }) => {
        const chainIdentifier = brandChainId(rawChainIdentifier);
        const [chainRes, chainsRes, categoriesRes] = await Promise.all([
            serverApiClient.GET("/chains/{chain_identifier}", {
                params: { path: { chain_identifier: chainIdentifier } },
            }),
            serverApiClient.GET("/chains"),
            serverApiClient.GET("/categories"),
        ]);
        const rawChain = chainRes.data;
        if (!rawChain) return null;
        const rawChains = chainsRes.data;
        const activityCategories = categoriesRes.data;
        if (!rawChains || !activityCategories) {
            throw new Error("Failed to fetch chains or categories");
        }
        const chain = brandRezervoChain(rawChain);
        const chains = rawChains.map(brandRezervoChain);
        const weekParam = resolveWeekParam(rawWeekParam);
        const scheduleDTO = await fetchScheduleWeekDTO(chainIdentifier, weekParam, getAllLocationIds(chain));
        return {
            chain,
            weekParam,
            chains,
            activityCategories,
            scheduleDTO,
        };
    });
