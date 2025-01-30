import { ActivityCategory, ChainIdentifier, ChainProfile, RezervoChain, RezervoClassBase } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";
import { SessionStatus } from "@/types/userSessions";

export type RezervoScheduleDTO = Record<string, RezervoWeekScheduleDTO>;
export interface RezervoWeekScheduleDTO {
    locationIds: string[];
    days: RezervoDayScheduleDTO[];
}
export interface RezervoDayScheduleDTO {
    date: string;
    classes: RezervoClassDTO[];
}
export type RezervoClassDTO = RezervoClassBase & {
    startTime: string;
    endTime: string;
};

export type SWRPrefetchedCacheData<T> = Record<string, T>;

export interface ChainPageProps {
    chain: RezervoChain;
    chainProfiles: ChainProfile[];
    swrPrefetched: SWRPrefetchedCacheData<RezervoWeekScheduleDTO>;
    activityCategories: ActivityCategory[];
    classPopularityIndex: ClassPopularityIndex;
    error?: RezervoError;
}

export interface IndexPageProps {
    chainProfiles: ChainProfile[];
}

export interface BaseUserSessionDTO {
    chain: ChainIdentifier;
    status: SessionStatus;
    positionInWaitList: number | null;
    classData: RezervoClassDTO;
}
