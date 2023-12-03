import { ChainProfile, RezervoClassBase } from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";

export type RezervoScheduleDTO = { [weekOffset: number]: RezervoWeekScheduleDTO };
export type RezervoWeekScheduleDTO = RezervoDayScheduleDTO[];
export type RezervoDayScheduleDTO = {
    date: string;
    classes: RezervoClassDTO[];
};
export type RezervoClassDTO = RezervoClassBase & {
    startTime: string;
    endTime: string;
};

export type ChainPageProps = {
    chainProfile: ChainProfile;
    initialSchedule: RezervoScheduleDTO;
    classPopularityIndex: ClassPopularityIndex;
    error?: RezervoError;
};
