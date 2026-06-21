import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { createClassPopularityIndex } from "@/lib/helpers/popularity";
import {
    ADJACENT_WEEK_OFFSETS,
    fetchScheduleWeekDTO,
    offsetWeekParam,
    SCHEDULE_STALE_TIME,
    scheduleQueryKey,
} from "@/lib/helpers/schedule";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";
import { FetchError } from "@/lib/utils/fetchUtils";
import { RezervoWeekSchedule } from "@/types/chain";
import { ClassPopularityIndex } from "@/types/popularity";
import { RezervoWeekScheduleDTO } from "@/types/serialization";

// Stable references so React Query memoizes the (expensive) select result and consumers keep a stable empty value.
const EMPTY_POPULARITY_INDEX: ClassPopularityIndex = {};
const selectClassPopularityIndex = (dto: RezervoWeekScheduleDTO): ClassPopularityIndex =>
    createClassPopularityIndex(deserializeWeekSchedule(dto));

export function useScheduleWeek(
    chainIdentifier: string | null,
    weekParam: string | null,
    locationIds: string[] | null,
) {
    const enabled = chainIdentifier != null && weekParam != null && locationIds != null;

    const dateFromWeekParam = weekParam ? fromCompactISOWeekString(weekParam) : null;
    const currentWeekDate =
        dateFromWeekParam !== null && dateFromWeekParam.isValid ? dateFromWeekParam : LocalizedDateTime.now();

    const { data, error, isLoading, isFetching, isPlaceholderData, isSuccess, dataUpdatedAt } = useQuery<
        RezervoWeekScheduleDTO,
        FetchError,
        RezervoWeekSchedule
    >({
        queryKey: scheduleQueryKey(chainIdentifier ?? "", weekParam ?? ""),
        queryFn: () => fetchScheduleWeekDTO(chainIdentifier ?? "", weekParam ?? "", locationIds ?? []),
        enabled,
        select: deserializeWeekSchedule,
        placeholderData: keepPreviousData,
        staleTime: SCHEDULE_STALE_TIME,
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
                staleTime: SCHEDULE_STALE_TIME,
            });
        }
    }, [queryClient, chainIdentifier, weekParam, locationIds, ready]);
}

export function useClassPopularityIndex(
    chainIdentifier: string | null,
    weekParam: string | null,
    locationIds: string[] | null,
): ClassPopularityIndex {
    const previousWeekParam = weekParam ? offsetWeekParam(weekParam, -1) : null;
    const enabled = chainIdentifier != null && previousWeekParam != null && locationIds != null;

    const { data } = useQuery<RezervoWeekScheduleDTO, FetchError, ClassPopularityIndex>({
        queryKey: scheduleQueryKey(chainIdentifier ?? "", previousWeekParam ?? ""),
        queryFn: () => fetchScheduleWeekDTO(chainIdentifier ?? "", previousWeekParam ?? "", locationIds ?? []),
        enabled,
        select: selectClassPopularityIndex,
        staleTime: SCHEDULE_STALE_TIME,
    });

    return data ?? EMPTY_POPULARITY_INDEX;
}
