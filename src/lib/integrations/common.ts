import { DateTime } from "luxon";

import { createClassPopularityIndex } from "@/lib/popularity";
import { serializeSchedule } from "@/lib/serializers";
import {
    ClassConfig,
    IntegrationPageProps,
    IntegrationProfile,
    RezervoBusinessUnit,
    RezervoCategory,
    RezervoClass,
    RezervoSchedule,
    RezervoWeekSchedule,
} from "@/types/rezervo";

export async function fetchIntegrationPageStaticProps<T>(
    integrationProfile: IntegrationProfile,
    businessUnit: RezervoBusinessUnit<T>,
): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> {
    const initialSchedule = await fetchRezervoSchedule(
        [-1, 0, 1, 2, 3],
        businessUnit.weekScheduleFetcher,
        businessUnit.weekScheduleAdapter,
    );
    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            integrationProfile: integrationProfile,
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

const categories: RezervoCategory[] = [
    {
        name: "Annet",
        color: "#FFFF66",
        keywords: ["happening", "event"],
    },
    {
        name: "Mosjon",
        color: "#00B050",
        keywords: ["godt voksen"],
    },
    {
        name: "Dans",
        color: "#E96179",
        keywords: ["dans", "dance", "sh'bam"],
    },
    {
        name: "Body & Mind",
        color: "#8BD4F0",
        keywords: ["yoga", "pilates", "smidig", "stretch", "mobilitet", "meditate"],
    },
    {
        name: "Kondisjon",
        color: "#6AD3B4",
        keywords: ["step", "løp", "puls", "bodyattack", "cardio"],
    },
    {
        name: "Spinning",
        color: "#4C2C7E",
        keywords: ["spin", "sykkel"],
    },
    {
        name: "Styrke & Utholdenhet",
        color: "#F8A800",
        keywords: ["pump", "styrke", "core", "sterk", "tabata", "stærk", "strength", "hardhausen", "slynge"],
    },
];

export function determineActivityCategory(activityName: string): RezervoCategory {
    return (
        categories.find((category) =>
            category.keywords.some((keyword) => activityName.toLowerCase().includes(keyword)),
        ) ?? categories[0]!
    );
}
