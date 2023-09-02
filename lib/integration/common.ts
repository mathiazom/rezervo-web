import { DateTime } from "luxon";

import { LOCALE, TIME_ZONE } from "config/config";
import { fscToRezervoWeekSchedule, sitToRezervoWeekSchedule } from "lib/integration/adapters";
import { fetchFscWeekSchedule } from "lib/integration/fsc";
import { fetchSitWeekSchedule } from "lib/integration/sit";
import { createClassPopularityIndex } from "lib/popularity";
import { serializeSchedule } from "lib/serializers";
import { FscWeekSchedule } from "types/integration/fsc";
import { SitWeekSchedule } from "types/integration/sit";
import {
    ClassConfig,
    IntegrationIdentifier,
    RezervoBusinessUnit,
    RezervoClass,
    RezervoIntegration,
    RezervoSchedule,
    RezervoWeekSchedule,
} from "types/rezervo";

export const calculateMondayOffset = () => DateTime.now().setZone(TIME_ZONE).weekday - 1;

export const getDateTime = (date: string): DateTime => DateTime.fromISO(date, { zone: TIME_ZONE, locale: LOCALE });

export const zeroIndexedWeekday = (oneIndexedWeekday: number): number => (oneIndexedWeekday + 6) % 7;

export const capitalizeFirstCharacter = (text: string) => {
    return `${text[0]!.toUpperCase()}${text.slice(1)}`;
};

export const getCapitalizedWeekday = (date: DateTime): string => {
    if (!date.isValid || date.weekdayLong === null) {
        throw new Error("Invalid date");
    }

    return capitalizeFirstCharacter(date.weekdayLong);
};

export async function fetchIntegrationPageStaticProps<T>(
    integration: IntegrationIdentifier,
    businessUnit: RezervoBusinessUnit<T>,
) {
    const initialSchedule = await fetchRezervoSchedule(
        [-1, 0, 1, 2, 3],
        businessUnit.weekScheduleFetcher,
        businessUnit.weekScheduleAdapter,
    );
    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            integration,
            initialSchedule: serializeSchedule(initialSchedule),
            classPopularityIndex,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

export async function fetchRezervoWeekSchedule<T>(
    weekOffset: number,
    weekScheduleFetcher: (weekOffset: number) => Promise<T>,
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule,
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
    weekScheduleFetcher: (weekOffset: number) => Promise<T>,
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule,
): Promise<RezervoSchedule> {
    const schedules = await Promise.all(
        weekOffsets.map(
            async (weekOffset: number): Promise<RezervoSchedule> => ({
                [weekOffset]: await fetchRezervoWeekSchedule(weekOffset, weekScheduleFetcher, weekScheduleAdapter),
            }),
        ),
    );

    return schedules.reduce((acc, next): RezervoSchedule => ({ ...acc, ...next }), {});
}

export function classConfigRecurrentId(classConfig: ClassConfig) {
    return recurrentClassId(classConfig.activity, classConfig.weekday, classConfig.time.hour, classConfig.time.minute);
}

export function classRecurrentId(_class: RezervoClass) {
    const { hour, minute, weekday } = _class.startTime;
    return recurrentClassId(_class.activity.id, (weekday + 6) % 7, hour, minute);
}

export function recurrentClassId(activityId: number, weekday: number, hour: number, minute: number) {
    return `${activityId}_${weekday}_${hour}_${minute}`;
}

export function isClassInThePast(_class: RezervoClass): boolean {
    return _class.startTime < DateTime.now();
}

export type IntegrationWeekSchedule = {
    [IntegrationIdentifier.sit]: SitWeekSchedule;
    [IntegrationIdentifier.fsc]: FscWeekSchedule;
};

export const activeIntegrations: {
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
        businessUnits: [
            {
                name: "Ski",
                weekScheduleFetcher: fetchFscWeekSchedule,
                weekScheduleAdapter: fscToRezervoWeekSchedule,
            },
        ],
    },
};
