import { compactISOWeekString, firstDateOfWeekByOffset } from "@/lib/helpers/date";
import { createClassPopularityIndex } from "@/lib/helpers/popularity";
import { get } from "@/lib/helpers/requests";
import { deserializeWeekSchedule } from "@/lib/serialization/deserializers";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";
import { ActivityCategory, ChainIdentifier, RezervoChain, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ChainPageProps, RezervoWeekScheduleDTO, SWRPrefetchedCacheData } from "@/types/serialization";

export function constructScheduleUrl(chainIdentifier: string, compactISOWeek: string, locationIds: string[]) {
    if (locationIds == undefined) {
        // make sure conditional fetching check fails
        return null;
    }
    const searchParams = new URLSearchParams([...locationIds.map((locationId) => ["location", locationId])]);
    return `schedule/${chainIdentifier}/${compactISOWeek}?${searchParams.toString()}`;
}

export async function fetchChainPageStaticProps(chain: RezervoChain): Promise<ChainPageProps> {
    let initialSchedule: RezervoSchedule | undefined;
    // TODO: consider not fetching all locations
    const locationIdentifiers = chain.branches.flatMap((branch) =>
        branch.locations.map((location) => location.identifier),
    );
    const chainProfiles = (await fetchActiveChains()).map((chain) => chain.profile);
    const activityCategories = await fetchActivityCategories();
    const compactISOWeeks = [-1, 0, 1, 2, 3].map(
        (weekOffset) => compactISOWeekString(firstDateOfWeekByOffset(weekOffset))!,
    );
    const emptyWeekScheduleFallbackKey = scheduleUrlKey(
        chain.profile.identifier,
        compactISOWeeks[1]!,
        locationIdentifiers,
    );
    try {
        initialSchedule = await fetchRezervoSchedule(chain.profile.identifier, compactISOWeeks, locationIdentifiers);
    } catch (e) {
        console.error(e);
        const firstDateOfWeek = firstDateOfWeekByOffset(0);
        return {
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
        };
    }

    const classPopularityIndex = createClassPopularityIndex(initialSchedule[compactISOWeeks[0]!]!);

    const swrPrefetched = Object.entries(initialSchedule).reduce((acc, [compactISOWeek, weekSchedule]) => {
        const key = scheduleUrlKey(chain.profile.identifier, compactISOWeek, locationIdentifiers);
        return key === null ? acc : { ...acc, [key]: serializeWeekSchedule(weekSchedule) };
    }, {}) as SWRPrefetchedCacheData<RezervoWeekScheduleDTO>;

    return {
        chain: chain,
        chainProfiles: chainProfiles,
        swrPrefetched: swrPrefetched,
        activityCategories: activityCategories,
        classPopularityIndex: classPopularityIndex,
    };
}

export async function fetchChain(
    chainIdentifier: ChainIdentifier,
    revalidate: number = 60 * 60,
): Promise<RezervoChain> {
    return get(`chains/${chainIdentifier}`, { mode: "server", revalidate }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch ${chainIdentifier} chain: ${res.statusText}`);
        }
        return res.json();
    });
}

export async function fetchActiveChains(revalidate: number = 60 * 60 * 24): Promise<RezervoChain[]> {
    return get("chains", { mode: "server", revalidate }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch active chains: ${res.statusText}`);
        }
        return res.json();
    });
}

export async function fetchRezervoWeekSchedule(
    chainIdentifier: string,
    compactISOWeek: string,
    locationIdentifiers: string[],
    revalidate: number = 5 * 60,
): Promise<RezervoWeekSchedule> {
    return deserializeWeekSchedule({
        locationIds: locationIdentifiers,
        ...(await (
            await get(
                `schedule/${chainIdentifier}/${compactISOWeek}${
                    locationIdentifiers.length > 0 ? `?location=${locationIdentifiers.join("&location=")}` : ""
                }`,
                { mode: "server", revalidate },
            )
        ).json()),
    }) as RezervoWeekSchedule;
}

export async function fetchRezervoSchedule(
    chainIdentifier: string,
    compactISOWeeks: string[],
    locationIdentifiers: string[] = [],
): Promise<RezervoSchedule> {
    return (
        await Promise.all(
            compactISOWeeks.map(
                async (compactISOWeek: string): Promise<RezervoSchedule> => ({
                    [compactISOWeek]: await fetchRezervoWeekSchedule(
                        chainIdentifier,
                        compactISOWeek,
                        locationIdentifiers,
                    ),
                }),
            ),
        )
    ).reduce((acc, next) => ({ ...acc, ...next }), {});
}

export async function fetchActivityCategories(revalidate: number = 60 * 60 * 24): Promise<ActivityCategory[]> {
    return get("categories", { mode: "server", revalidate }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch activity categories: ${res.statusText}`);
        }
        return res.json();
    });
}

export function scheduleUrlKey(chainIdentifier: string, compactISOWeek: string, locationIds: string[]) {
    if (locationIds == undefined) {
        // make sure conditional fetching check fails
        return null;
    }
    return constructScheduleUrl(
        chainIdentifier,
        compactISOWeek,
        [...locationIds].sort(), // ensure cache hit with consistent ordering
    );
}
