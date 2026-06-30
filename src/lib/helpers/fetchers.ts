import { cacheTag } from "next/cache";

import {
    compactISOWeekString,
    firstDateOfWeekByOffset,
    fromCompactISOWeekString,
    LocalizedDateTime,
} from "@/lib/helpers/date";
import { get } from "@/lib/helpers/requests";
import { constructScheduleUrl } from "@/lib/helpers/schedule";
import { ActivityCategory, ChainIdentifier, RezervoChain } from "@/types/chain";
import { ChainPageProps, RezervoWeekScheduleDTO } from "@/types/serialization";

export async function fetchScheduleWeekDTOServer(
    chainIdentifier: string,
    weekParam: string,
    locationIds: string[],
): Promise<RezervoWeekScheduleDTO> {
    "use cache";
    cacheTag("schedule");
    const url = constructScheduleUrl(chainIdentifier, weekParam, locationIds);
    const res = await get(url, { mode: "server" });
    if (!res.ok) {
        throw new Error(`Failed to fetch schedule for ${chainIdentifier} ${weekParam}: ${res.statusText}`);
    }
    return { ...(await res.json()), locationIds };
}

export async function fetchChainPageStaticProps(
    chain: RezervoChain,
    weekParam: string | undefined,
): Promise<ChainPageProps> {
    let referenceDateTime = weekParam ? fromCompactISOWeekString(weekParam) : null;
    if (!referenceDateTime || !referenceDateTime.isValid) referenceDateTime = LocalizedDateTime.now();
    const currentCompactIsoWeek = compactISOWeekString(firstDateOfWeekByOffset(referenceDateTime, 0));
    const chainProfiles = await fetchActiveChains().then((chains) => chains.map((c) => c.profile));
    const activityCategories = await fetchActivityCategories();

    return {
        chain: chain,
        weekParam: currentCompactIsoWeek,
        chainProfiles: chainProfiles,
        activityCategories: activityCategories,
    };
}

export async function fetchChain(chainIdentifier: ChainIdentifier): Promise<RezervoChain> {
    "use cache";
    cacheTag("chains");
    return get(`chains/${chainIdentifier}`, { mode: "server" }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch ${chainIdentifier} chain: ${res.statusText}`);
        }
        return res.json();
    });
}

export async function fetchActiveChains(): Promise<RezervoChain[]> {
    "use cache";
    cacheTag("chains");
    return get("chains", { mode: "server" }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch active chains: ${res.statusText}`);
        }
        return res.json();
    });
}

export async function fetchActivityCategories(): Promise<ActivityCategory[]> {
    "use cache";
    cacheTag("categories");
    return get("categories", { mode: "server" }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch activity categories: ${res.statusText}`);
        }
        return res.json();
    });
}
