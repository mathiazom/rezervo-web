import { compactISOWeekString, firstDateOfWeekByOffset, fromCompactISOWeekString } from "@/lib/helpers/date";
import { fetcher } from "@/lib/utils/fetchUtils";
import { RezervoWeekScheduleDTO } from "@/types/serialization";

// Schedule data is cached for an hour server-side; client queries reuse that window and silently refresh on load.
export const SCHEDULE_STALE_TIME_MS = 60 * 60 * 1000;

// Background-prefetched weeks relative to the current week: previous week + next 3 weeks.
export const ADJACENT_WEEK_OFFSETS = [-1, 1, 2, 3];

export function constructScheduleUrl(chainIdentifier: string, compactISOWeek: string, locationIds: string[]) {
    const searchParams = new URLSearchParams([...locationIds.map((locationId) => ["location", locationId])]);
    return `schedule/${chainIdentifier}/${compactISOWeek}?${searchParams.toString()}`;
}

export function scheduleQueryKey(chainIdentifier: string, weekParam: string) {
    return ["schedule", chainIdentifier, weekParam] as const;
}

export function offsetWeekParam(weekParam: string, offset: number): string | null {
    const reference = fromCompactISOWeekString(weekParam);
    if (!reference.isValid) return null;
    return compactISOWeekString(firstDateOfWeekByOffset(reference, offset));
}

/**
 * Fetches a week's schedule (all locations) from the browser as a serializable DTO.
 * The DTO (rather than the deserialized form) is what lives in the React Query cache, so it can be
 * dehydrated from the server and hydrated on the client without losing Luxon DateTime objects.
 */
export async function fetchScheduleWeekDTO(
    chainIdentifier: string,
    weekParam: string,
    locationIds: string[],
): Promise<RezervoWeekScheduleDTO> {
    const url = constructScheduleUrl(chainIdentifier, weekParam, locationIds);
    // The backend response does not include the requested locationIds, so inject them for deserialization.
    const dto = await fetcher<Omit<RezervoWeekScheduleDTO, "locationIds">>(url);
    return { ...dto, locationIds };
}
