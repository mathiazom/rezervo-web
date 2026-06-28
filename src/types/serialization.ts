import { ActivityCategory, ChainIdentifier, ChainProfile, RezervoChain, RezervoClassBase } from "@/types/chain";
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

export interface ChainPageProps {
    chain: RezervoChain;
    weekParam: string;
    chainProfiles: ChainProfile[];
    activityCategories: ActivityCategory[];
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
