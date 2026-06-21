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
    revalidate: number = 60 * 60,
): Promise<RezervoWeekScheduleDTO> {
    const url = constructScheduleUrl(chainIdentifier, weekParam, locationIds);
    if (url === null) {
        throw new Error("Invalid schedule request");
    }
    const res = await get(url, { mode: "server", revalidate });
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

export async function fetchActivityCategories(revalidate: number = 60 * 60 * 24): Promise<ActivityCategory[]> {
    return get("categories", { mode: "server", revalidate }).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to fetch activity categories: ${res.statusText}`);
        }
        return res.json();
    });
}
