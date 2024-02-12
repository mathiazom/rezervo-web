import { getChains } from "@/lib/activeChains";
import { firstDateOfWeekByOffset } from "@/lib/helpers/date";
import { createClassPopularityIndex } from "@/lib/helpers/popularity";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";
import { ActivityCategory, BaseRezervoChain, RezervoChain, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ChainPageProps, RezervoWeekScheduleDTO, SWRPrefetchedCacheData } from "@/types/serialization";

export function constructScheduleUrl(chainIdentifier: string, currentWeekOffset: number, locationIds: string[]) {
    if (locationIds == undefined) {
        // make sure conditional fetching check fails
        return null;
    }
    const searchParams = new URLSearchParams([
        ["weekOffset", currentWeekOffset.toString()],
        ...locationIds.map((locationId) => ["locationId", locationId]),
    ]);
    return `/api/${chainIdentifier}/schedule?${searchParams.toString()}`;
}

export async function fetchChainPageStaticProps(chain: RezervoChain): Promise<{
    revalidate: number;
    props: ChainPageProps;
}> {
    let initialSchedule: RezervoSchedule | undefined;
    // TODO: consider not fetching all locations
    const locationIdentifiers = chain.branches.flatMap((branch) =>
        branch.locations.map((location) => location.identifier),
    );
    const chainProfiles = (await getChains()).map((chain) => chain.profile);
    const activityCategories = await fetchActivityCategories();
    const emptyWeekScheduleFallbackKey = scheduleUrlKey(chain.profile.identifier, 0, locationIdentifiers);
    try {
        initialSchedule = await fetchRezervoSchedule(chain.profile.identifier, [-1, 0, 1, 2, 3], locationIdentifiers);
    } catch (e) {
        console.error(e);
        const firstDateOfWeek = firstDateOfWeekByOffset(0);
        return {
            props: {
                chain: chain,
                chainProfiles: chainProfiles,
                swrPrefetched: {
                    ...(emptyWeekScheduleFallbackKey !== null
                        ? {
                              [emptyWeekScheduleFallbackKey]: serializeWeekSchedule({
                                  locationIds: locationIdentifiers,
                                  days: Array.from({ length: 7 }, (_, i) => ({
                                      date: firstDateOfWeek.plus({ day: i }),
                                      classes: [],
                                  })),
                              }),
                          }
                        : {}),
                },
                activityCategories: activityCategories,
                classPopularityIndex: {},
                error: RezervoError.CHAIN_SCHEDULE_UNAVAILABLE,
            },
            revalidate: 1,
        };
    }

    const classPopularityIndex = createClassPopularityIndex(initialSchedule[-1]!);
    const invalidationTimeInSeconds = 5 * 60;

    const swrPrefetched = Object.entries(initialSchedule).reduce((acc, [weekOffset, weekSchedule]) => {
        const key = scheduleUrlKey(chain.profile.identifier, Number(weekOffset), locationIdentifiers);
        return key === null ? acc : { ...acc, [key]: serializeWeekSchedule(weekSchedule) };
    }, {}) as SWRPrefetchedCacheData<RezervoWeekScheduleDTO>;

    return {
        props: {
            chain: chain,
            chainProfiles: chainProfiles,
            swrPrefetched: swrPrefetched,
            activityCategories: activityCategories,
            classPopularityIndex: classPopularityIndex,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

export async function fetchActiveChains(): Promise<BaseRezervoChain[]> {
    return fetch(`${process.env["CONFIG_HOST"]}/chains`).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch active chains: ${res.statusText}`);
        }
        return res.json();
    });
}

export async function fetchRezervoWeekSchedule(
    chain_identifier: string,
    weekOffset: number,
    locationIdentifiers: string[],
): Promise<RezervoWeekSchedule> {
    return deserializeWeekSchedule({
        locationIds: locationIdentifiers,
        ...(await (
            await fetch(
                `${process.env["CONFIG_HOST"]}/schedule/${chain_identifier}/${weekOffset}${
                    locationIdentifiers.length > 0 ? `?location=${locationIdentifiers.join("&location=")}` : ""
                }`,
            )
        ).json()),
    }) as RezervoWeekSchedule;
}

export async function fetchRezervoSchedule(
    chainIdentifier: string,
    weekOffsets: number[],
    locationIdentifiers: string[] = [],
): Promise<RezervoSchedule> {
    return (
        await Promise.all(
            weekOffsets.map(
                async (weekOffset: number): Promise<RezervoSchedule> => ({
                    [weekOffset]: await fetchRezervoWeekSchedule(chainIdentifier, weekOffset, locationIdentifiers),
                }),
            ),
        )
    ).reduce((acc, next) => ({ ...acc, ...next }), {});
}

export async function fetchActivityCategories(): Promise<ActivityCategory[]> {
    return fetch(`${process.env["CONFIG_HOST"]}/categories`).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch activity categories: ${res.statusText}`);
        }
        return res.json();
    });
}

export function scheduleUrlKey(chainIdentifier: string, weekOffset: number, locationIds: string[]) {
    if (locationIds == undefined) {
        // make sure conditional fetching check fails
        return null;
    }
    return constructScheduleUrl(
        chainIdentifier,
        weekOffset,
        [...locationIds].sort(), // ensure cache hit with consistent ordering
    );
}
