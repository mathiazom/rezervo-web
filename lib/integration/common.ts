import { DateTime, DateTimeOptions } from "luxon";
import { TIME_ZONE } from "../../config/config";
import { RezervoSchedule, RezervoWeekSchedule } from "../../types/rezervo";
import { createClassPopularityIndex } from "../popularity";

export const calculateMondayOffset = () => DateTime.now().setZone(TIME_ZONE).weekday - 1;

const localizedDateTimeOptions: DateTimeOptions = { zone: TIME_ZONE, locale: "no" };
export const getDateTime = (date: string): DateTime => DateTime.fromISO(date, localizedDateTimeOptions);

export const getCapitalizedWeekday = (date: DateTime): string => {
    if (!date.isValid || date.weekdayLong === null) {
        throw new Error("Invalid date");
    }

    return `${date.weekdayLong[0]!.toUpperCase()}${date.weekdayLong.slice(1)}`;
};

export async function fetchIntegrationPageStaticProps<T>(
    // eslint-disable-next-line no-unused-vars
    weekScheduleFetcher: (weekOffset: number) => Promise<T>,
    // eslint-disable-next-line no-unused-vars
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule
) {
    const initialSchedule = await fetchRezervoSchedule([-1, 0, 1, 2, 3], weekScheduleFetcher, weekScheduleAdapter);
    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            initialSchedule,
            classPopularityIndex,
        },
        revalidate: invalidationTimeInSeconds,
    };
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

    return schedules.reduce((acc, next): RezervoSchedule => ({ ...acc, ...next }), {});
}
