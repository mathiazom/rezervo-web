import { createClassPopularityIndex } from "@/lib/helpers/popularity";
import { serializeSchedule } from "@/lib/serialization/serializers";
import { RezervoChain, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ChainPageProps } from "@/types/serialization";

export async function fetchChainPageStaticProps<T>(chain: RezervoChain<T>): Promise<{
    revalidate: number;
    props: ChainPageProps;
}> {
    let initialSchedule;
    try {
        initialSchedule = await fetchRezervoSchedule(
            [-1, 0, 1, 2, 3],
            chain.provider.weekScheduleFetcher,
            chain.provider.weekScheduleAdapter,
        );
    } catch (e) {
        console.error(e);
        return {
            props: {
                chainProfile: chain.profile,
                initialSchedule: { 0: [] },
                classPopularityIndex: {},
                error: RezervoError.CHAIN_SCHEDULE_UNAVAILABLE,
            },
            revalidate: 1,
        };
    }

    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 5 * 60;

    return {
        props: {
            chainProfile: chain.profile,
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
