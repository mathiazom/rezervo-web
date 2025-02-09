import {
    compactISOWeekString,
    firstDateOfWeekByOffset,
    fromCompactISOWeekString,
    LocalizedDateTime,
} from "@/lib/helpers/date";
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

export async function fetchChainPageStaticProps(
    chain: RezervoChain,
    weekParam: string | undefined,
): Promise<ChainPageProps> {
    // TODO: consider not fetching all locations
    const locationIdentifiers = chain.branches.flatMap((branch) =>
        branch.locations.map((location) => location.identifier),
    );
    let referenceDateTime = weekParam ? fromCompactISOWeekString(weekParam) : null;
    if (!referenceDateTime || !referenceDateTime.isValid) referenceDateTime = LocalizedDateTime.now();
    const currentCompactIsoWeek = compactISOWeekString(firstDateOfWeekByOffset(referenceDateTime, 0));
    const previousCompactIsoWeek = compactISOWeekString(firstDateOfWeekByOffset(referenceDateTime, 1));
    const compactISOWeeks = [previousCompactIsoWeek, currentCompactIsoWeek].concat(
        [1, 2, 3].map((weekOffset) => compactISOWeekString(firstDateOfWeekByOffset(referenceDateTime, weekOffset))),
    );
    const chainProfiles = await fetchActiveChains().then((chains) => chains.map((chain) => chain.profile));
    const activityCategories = await fetchActivityCategories();
    const scheduleResult = await tryFetchRezervoSchedule(
        chain.profile.identifier,
        compactISOWeeks,
        locationIdentifiers,
    );
    if (!scheduleResult.ok) {
        return {
            chain: chain,
            weekParam: currentCompactIsoWeek,
            chainProfiles: chainProfiles,
            activityCategories: activityCategories,
            error: RezervoError.CHAIN_SCHEDULE_UNAVAILABLE,
        };
    }
    const schedule = scheduleResult.value;
    const previousWeekSchedule = schedule[previousCompactIsoWeek];
    const classPopularityIndex = previousWeekSchedule ? createClassPopularityIndex(previousWeekSchedule) : {};

    const scheduleCache: SWRPrefetchedCacheData<RezervoWeekScheduleDTO> = Object.entries(schedule).reduce(
        (acc, [compactISOWeek, weekSchedule]) => {
            const key = scheduleUrlKey(chain.profile.identifier, compactISOWeek, locationIdentifiers);
            return key === null ? acc : { ...acc, [key]: serializeWeekSchedule(weekSchedule) };
        },
        {},
    );

    return {
        chain: chain,
        weekParam: currentCompactIsoWeek,
        defaultLocationIds: locationIdentifiers,
        chainProfiles: chainProfiles,
        scheduleCache: scheduleCache,
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

type RezervoScheduleResult = { ok: true; value: RezervoSchedule } | { ok: false };

async function tryFetchRezervoSchedule(
    chainIdentifier: string,
    compactISOWeeks: string[],
    locationIdentifiers: string[] = [],
): Promise<RezervoScheduleResult> {
    try {
        const schedule = await fetchRezervoSchedule(chainIdentifier, compactISOWeeks, locationIdentifiers);
        return {
            ok: true,
            value: schedule,
        };
    } catch (e) {
        console.error(e);
        return {
            ok: false,
        };
    }
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
    return constructScheduleUrl(
        chainIdentifier,
        compactISOWeek,
        [...locationIds].sort(), // ensure cache hit with consistent ordering
    );
}
