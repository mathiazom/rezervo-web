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
    // The backend response does not include the requested locationIds, so inject them for deserialization.
    return { ...data!, locationIds };
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
        const chain = chainRes.data!;
        const weekParam = resolveWeekParam(rawWeekParam);
        const allLocationIds = getAllLocationIds(chain);
        const scheduleDTO = await fetchScheduleWeekDTO(chainIdentifier, weekParam, allLocationIds);
        return {
            chain,
            weekParam,
            chainProfiles: chainsRes.data!.map((c) => c.profile),
            activityCategories: categoriesRes.data!,
            allLocationIds,
            scheduleDTO,
        };
    });
