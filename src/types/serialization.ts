import { ChainProfile, RezervoChain, RezervoClassBase } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";

export type RezervoScheduleDTO = {
    [weekOffset: number]: RezervoWeekScheduleDTO;
};
export type RezervoWeekScheduleDTO = {
    locationIds: string[];
    days: RezervoDayScheduleDTO[];
};
export type RezervoDayScheduleDTO = {
    date: string;
    classes: RezervoClassDTO[];
};
export type RezervoClassDTO = RezervoClassBase & {
    startTime: string;
    endTime: string;
};

export type SWRPrefetchedCacheData<T> = {
    [key: string]: T;
};

export type ChainPageProps = {
    chain: RezervoChain;
    chainProfiles: ChainProfile[];
    swrPrefetched: SWRPrefetchedCacheData<RezervoWeekScheduleDTO>;
    activityCategories: string[];
    classPopularityIndex: ClassPopularityIndex;
    error?: RezervoError;
};

export type IndexPageProps = {
    chainProfiles: ChainProfile[];
};
