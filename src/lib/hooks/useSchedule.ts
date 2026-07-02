import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { ADJACENT_WEEK_OFFSETS, fetchScheduleWeekDTO, offsetWeekParam, scheduleQueryKey } from "@/lib/helpers/schedule";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";

export function useScheduleWeek(
    chainIdentifier: string | null,
    weekParam: string | null,
    locationIds: string[] | null,
) {
    const enabled = chainIdentifier != null && weekParam != null && locationIds != null;

    const dateFromWeekParam = weekParam ? fromCompactISOWeekString(weekParam) : null;
    const currentWeekDate =
        dateFromWeekParam !== null && dateFromWeekParam.isValid ? dateFromWeekParam : LocalizedDateTime.now();

    const { data, error, isLoading, isFetching, isPlaceholderData, isSuccess, dataUpdatedAt } = useQuery({
        queryKey: scheduleQueryKey(chainIdentifier ?? "", weekParam ?? ""),
        queryFn: () => fetchScheduleWeekDTO(chainIdentifier ?? "", weekParam ?? "", locationIds ?? []),
        enabled,
        select: deserializeWeekSchedule,
        placeholderData: keepPreviousData,
    });

    const [latestLoadedWeekParam, setLatestLoadedWeekParam] = useState<string | null>(null);
    useEffect(() => {
        if (isSuccess && !isPlaceholderData && weekParam != null) {
            setLatestLoadedWeekParam(weekParam);
        }
    }, [isSuccess, isPlaceholderData, weekParam, dataUpdatedAt]);

    const latestLoadedDate = latestLoadedWeekParam ? fromCompactISOWeekString(latestLoadedWeekParam) : null;
    const isNavigating = isFetching && isPlaceholderData;

    return {
        weekSchedule: data ?? null,
        weekScheduleError: error,
        isLoadingInitial: enabled && isLoading,
        isLoadingPreviousWeek: isNavigating && latestLoadedDate != null && latestLoadedDate > currentWeekDate,
        isLoadingNextWeek: isNavigating && latestLoadedDate != null && latestLoadedDate < currentWeekDate,
    };
}

export function usePrefetchAdjacentWeeks(
    chainIdentifier: string | null,
    weekParam: string | null,
    locationIds: string[] | null,
    ready: boolean,
) {
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!ready || chainIdentifier == null || weekParam == null || locationIds == null) {
            return;
        }
        for (const offset of ADJACENT_WEEK_OFFSETS) {
            const week = offsetWeekParam(weekParam, offset);
            if (week == null) continue;
            void queryClient.prefetchQuery({
                queryKey: scheduleQueryKey(chainIdentifier, week),
                queryFn: () => fetchScheduleWeekDTO(chainIdentifier, week, locationIds),
            });
        }
    }, [queryClient, chainIdentifier, weekParam, locationIds, ready]);
}
