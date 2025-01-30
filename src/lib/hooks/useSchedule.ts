import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import useSWR, { preload, useSWRConfig } from "swr";

import { compactISOWeekString, fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { scheduleUrlKey } from "@/lib/helpers/fetchers";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { RezervoWeekScheduleDTO } from "@/types/serialization";

export function useSchedule(chainIdentifier: string | null, weekParam: string | null, locationIds: string[] | null) {
    const [latestLoadedWeekDate, setLatestLoadedWeekDate] = useState<DateTime | null>(null);
    const dateFromWeekParam = weekParam ? fromCompactISOWeekString(weekParam) : null;
    const currentWeekDate =
        dateFromWeekParam !== null && dateFromWeekParam.isValid ? dateFromWeekParam : LocalizedDateTime.now();

    const { cache } = useSWRConfig();

    // prefetch previous and next week if not in cache
    useEffect(() => {
        if (!currentWeekDate.isValid || locationIds == null || chainIdentifier == null) return;

        for (const compactISOWeek of [
            compactISOWeekString(currentWeekDate.minus({ week: 1 })),
            compactISOWeekString(currentWeekDate.plus({ week: 1 })),
        ]) {
            const key = scheduleUrlKey(chainIdentifier, compactISOWeek, locationIds);
            if (key !== null && cache.get(key) === undefined) {
                preload(key, fetcher);
            }
        }
    }, [chainIdentifier, locationIds, cache, currentWeekDate]);

    const { data, error, isLoading } = useSWR<RezervoWeekScheduleDTO>(
        locationIds == null || weekParam == null || chainIdentifier == null
            ? null
            : scheduleUrlKey(chainIdentifier, weekParam, locationIds),
        fetcher,
        {
            onSuccess: () => setLatestLoadedWeekDate(currentWeekDate),
            keepPreviousData: true,
            revalidateIfStale: false,
        },
    );

    const weekSchedule = useMemo(() => {
        return data ? deserializeWeekSchedule(data) : null;
    }, [data]);

    return {
        isLoadingPreviousWeek: isLoading && latestLoadedWeekDate != null && latestLoadedWeekDate > currentWeekDate,
        isLoadingNextWeek: isLoading && latestLoadedWeekDate != null && latestLoadedWeekDate < currentWeekDate,
        weekSchedule: weekSchedule,
        weekScheduleError: error,
    };
}
