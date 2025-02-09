import { ActivityCategory, ChainIdentifier, ChainProfile, RezervoChain, RezervoClassBase } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";
import { SessionStatus } from "@/types/userSessions";

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

export type ChainPageProps = {
    chain: RezervoChain;
    weekParam: string;
    chainProfiles: ChainProfile[];
    activityCategories: ActivityCategory[];
} & (
    | {
          defaultLocationIds: string[];
          scheduleCache: SWRPrefetchedCacheData<RezervoWeekScheduleDTO>;
          classPopularityIndex: ClassPopularityIndex;
          error?: never;
      }
    | {
          defaultLocationIds?: never;
          scheduleCache?: never;
          classPopularityIndex?: never;
          error: RezervoError.CHAIN_SCHEDULE_UNAVAILABLE;
      }
);

export interface IndexPageProps {
    chainProfiles: ChainProfile[];
}

export interface BaseUserSessionDTO {
    chain: ChainIdentifier;
    status: SessionStatus;
    positionInWaitList: number | null;
    classData: RezervoClassDTO;
}
