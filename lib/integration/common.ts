import { DateTime } from "luxon";
import { LOCALE, TIME_ZONE } from "../../config/config";
import { IntegrationIdentifier, RezervoIntegration, RezervoSchedule, RezervoWeekSchedule } from "../../types/rezervo";
import { createClassPopularityIndex } from "../popularity";
import { fetchSitWeekSchedule } from "./sit";
import { sitToRezervoWeekSchedule } from "./adapters";
import { SitWeekSchedule } from "../../types/integration/sit";
import { FscWeekSchedule } from "../../types/integration/fsc";

export const calculateMondayOffset = () => DateTime.now().setZone(TIME_ZONE).weekday - 1;

export const getDateTime = (date: string): DateTime => DateTime.fromISO(date, { zone: TIME_ZONE, locale: LOCALE });

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
    const weekSchedule = weekScheduleAdapter(await weekScheduleFetcher(weekOffset));
    if (
        weekSchedule.length !== 7 ||
        weekSchedule.some((daySchedule) => daySchedule === null || daySchedule === undefined)
    ) {
        throw new Error("Week schedule must have 7 valid DaySchedule entries");
    }
    return weekSchedule;
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

export type IntegrationWeekSchedule = {
    [IntegrationIdentifier.sit]: SitWeekSchedule;
    [IntegrationIdentifier.fsc]: FscWeekSchedule;
};

export const activeIntegrations: {
    // eslint-disable-next-line no-unused-vars
    [identifier in IntegrationIdentifier]: RezervoIntegration<IntegrationWeekSchedule[identifier]>;
} = {
    [IntegrationIdentifier.sit]: {
        name: "Sit Trening",
        acronym: IntegrationIdentifier.sit,
        businessUnits: [
            {
                name: "Trondheim",
                weekScheduleFetcher: fetchSitWeekSchedule,
                weekScheduleAdapter: sitToRezervoWeekSchedule,
            },
        ],
    },
    [IntegrationIdentifier.fsc]: {
        name: "Family Sports Club",
        acronym: IntegrationIdentifier.fsc,
        businessUnits: [],
    },
};
