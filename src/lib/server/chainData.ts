import { createServerFn } from "@tanstack/react-start";

import { serverApiClient } from "@/lib/api/client";
import { getAllLocationIds } from "@/lib/helpers/chain";
import {
    compactISOWeekString,
    firstDateOfWeekByOffset,
    fromCompactISOWeekString,
    LocalizedDateTime,
} from "@/lib/helpers/date";

function resolveWeekParam(rawWeekParam: string | undefined): string {
    let referenceDateTime = rawWeekParam ? fromCompactISOWeekString(rawWeekParam) : null;
    if (!referenceDateTime || !referenceDateTime.isValid) referenceDateTime = LocalizedDateTime.now();
    return compactISOWeekString(firstDateOfWeekByOffset(referenceDateTime, 0));
}

async function fetchScheduleWeekDTO(chainIdentifier: string, weekParam: string, locationIds: string[]) {
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
    return { ...data, locationIds };
}

export const getChainPageDataFn = createServerFn({ method: "GET" })
    .validator((data: { chainIdentifier: string; weekParam: string | undefined }) => data)
    .handler(async ({ data: { chainIdentifier, weekParam: rawWeekParam } }) => {
        const [chainRes, chainsRes, categoriesRes] = await Promise.all([
            serverApiClient.GET("/chains/{chain_identifier}", {
                params: { path: { chain_identifier: chainIdentifier } },
            }),
            serverApiClient.GET("/chains"),
            serverApiClient.GET("/categories"),
        ]);
        const chain = chainRes.data;
        if (!chain) return null;
        const chains = chainsRes.data;
        const activityCategories = categoriesRes.data;
        if (!chains || !activityCategories) {
            throw new Error("Failed to fetch chains or categories");
        }
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
