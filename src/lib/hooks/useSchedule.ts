import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import useSWR from "swr";

import { fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { scheduleUrlKey } from "@/lib/helpers/fetchers";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";
import { fetcher } from "@/lib/utils/fetchUtils";
import { RezervoWeekScheduleDTO } from "@/types/serialization";

export function useSchedule(chainIdentifier: string | null, weekParam: string | null, locationIds: string[] | null) {
    const [latestLoadedWeekDate, setLatestLoadedWeekDate] = useState<DateTime | null>(null);
    const dateFromWeekParam = weekParam ? fromCompactISOWeekString(weekParam) : null;
    const currentWeekDate =
        dateFromWeekParam !== null && dateFromWeekParam.isValid ? dateFromWeekParam : LocalizedDateTime.now();

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
