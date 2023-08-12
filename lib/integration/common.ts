import { DateTime } from "luxon";
import { TIME_ZONE } from "../../config/config";
import { RezervoSchedule, RezervoWeekSchedule } from "../../types/rezervo";

export const calculateMondayOffset = () => DateTime.now().setZone(TIME_ZONE).weekday - 1;

export function uniteSchedules(schedules: RezervoSchedule[]): RezervoSchedule {
    return schedules.reduce((acc, next): RezervoSchedule => ({ ...acc, ...next }), {});
}

export async function fetchRezervoWeekSchedule<T>(
    weekOffset: number,
    // eslint-disable-next-line no-unused-vars
    weekScheduleFetcher: (weekOffset: number) => Promise<T>,
    // eslint-disable-next-line no-unused-vars
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule
): Promise<RezervoWeekSchedule> {
    return weekScheduleAdapter(await weekScheduleFetcher(weekOffset));
}

export async function fetchRezervoSchedule<T>(
    weekOffsets: number[],
    // eslint-disable-next-line no-unused-vars
    weekScheduleFetcher: (weekOffset: number) => Promise<T>,
    // eslint-disable-next-line no-unused-vars
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule
): Promise<RezervoSchedule> {
    const schedules = await Promise.all(
        weekOffsets.map(
            async (weekOffset: number): Promise<RezervoSchedule> => ({
                [weekOffset]: await fetchRezervoWeekSchedule(weekOffset, weekScheduleFetcher, weekScheduleAdapter),
            })
        )
    );

    return uniteSchedules(schedules);
}
