import {
    compactISOWeekString,
    firstDateOfWeekByOffset,
    fromCompactISOWeekString,
    LocalizedDateTime,
} from "@/lib/helpers/date";
import { apiClient } from "@/lib/api/client";
import { RezervoWeekSchedule, RezervoWeekScheduleDTO } from "@/types/openapi";

// Background-prefetched weeks relative to the current week: previous week + next 3 weeks.
export const ADJACENT_WEEK_OFFSETS = [-1, 1, 2, 3];

export function scheduleQueryKey(chainIdentifier: string, weekParam: string) {
    return ["schedule", chainIdentifier, weekParam] as const;
}

export function offsetWeekParam(weekParam: string, offset: number): string | null {
    const reference = fromCompactISOWeekString(weekParam);
    if (!reference.isValid) return null;
    return compactISOWeekString(firstDateOfWeekByOffset(reference, offset));
}

export function getWeekNumber(weekSchedule: RezervoWeekSchedule | null, weekParam: string): number {
    if (weekSchedule != null) {
        const firstDay = weekSchedule.days[0];
        if (firstDay === undefined) {
            throw new Error("Week schedule is empty (missing first day)");
        }
        return firstDay.date.weekNumber;
    }
    const date = fromCompactISOWeekString(weekParam);
    return date.isValid ? date.weekNumber : LocalizedDateTime.now().weekNumber;
}

export async function fetchScheduleWeekDTO(
    chainIdentifier: string,
    weekParam: string,
    locationIds: string[],
): Promise<RezervoWeekScheduleDTO> {
    const { data } = await apiClient.GET("/schedule/{chain_identifier}/{compact_iso_week}", {
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
