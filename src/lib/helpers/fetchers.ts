import { createClassPopularityIndex } from "@/lib/helpers/popularity";
import { serializeSchedule } from "@/lib/serialization/serializers";
import { RezervoError } from "@/types/errors";
import { RezervoBusinessUnit, RezervoIntegration, RezervoSchedule, RezervoWeekSchedule } from "@/types/integration";
import { IntegrationPageProps } from "@/types/serialization";

export async function fetchIntegrationPageStaticProps<T>(
    integration: RezervoIntegration<T>,
    businessUnit: RezervoBusinessUnit<T>,
): Promise<{
    revalidate: number;
    props: IntegrationPageProps;
}> {
    let initialSchedule;
    try {
        initialSchedule = await fetchRezervoSchedule(
            [-1, 0, 1, 2, 3],
            businessUnit.weekScheduleFetcher,
            integration.weekScheduleAdapter,
        );
    } catch (e) {
        console.error(e);
        return {
            props: {
                integrationProfile: integration.profile,
                initialSchedule: { 0: [] },
                classPopularityIndex: {},
                error: RezervoError.INTEGRATION_SCHEDULE_UNAVAILABLE,
            },
            revalidate: 1,
        };
    }

    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 5 * 60;

    return {
        props: {
            integrationProfile: integration.profile,
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
