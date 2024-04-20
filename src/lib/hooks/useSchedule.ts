import { useEffect, useMemo, useState } from "react";
import useSWR, { preload, useSWRConfig } from "swr";

import { scheduleUrlKey } from "@/lib/helpers/fetchers";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { RezervoWeekScheduleDTO } from "@/types/serialization";

export function useSchedule(chainIdentifier: string | null, currentWeekOffset: number, locationIds: string[] | null) {
    const [latestLoadedWeekOffset, setLatestLoadedWeekOffset] = useState<number | null>(null);

    const { cache } = useSWRConfig();

    // prefetch previous and next week if not in cache
    useEffect(() => {
        if (locationIds == null || currentWeekOffset == null || chainIdentifier == null) return;
        for (const weekOffset of [currentWeekOffset - 1, currentWeekOffset + 1]) {
            const key = scheduleUrlKey(chainIdentifier, weekOffset, locationIds);
            if (key !== null && cache.get(key) === undefined) {
                preload(key, fetcher);
            }
        }
    }, [currentWeekOffset, chainIdentifier, locationIds, cache]);

    const { data, error, isLoading } = useSWR<RezervoWeekScheduleDTO>(
        locationIds == null || currentWeekOffset == null || chainIdentifier == null
            ? null
            : scheduleUrlKey(chainIdentifier, currentWeekOffset, locationIds),
        fetcher,
        {
            onSuccess: () => setLatestLoadedWeekOffset(currentWeekOffset),
            keepPreviousData: true,
            revalidateIfStale: false,
        },
    );

    const weekSchedule = useMemo(() => {
        return data ? deserializeWeekSchedule(data) : null;
    }, [data]);

    return {
        latestLoadedWeekOffset: latestLoadedWeekOffset,
        weekSchedule: weekSchedule,
        weekScheduleError: error,
        weekScheduleLoading: isLoading,
    };
}
