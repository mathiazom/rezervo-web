import { ClassPopularityIndex } from "@/types/popularity";
import { IntegrationProfile, RezervoClassBase } from "@/types/rezervo";

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

export type IntegrationPageProps = {
    integrationProfile: IntegrationProfile;
    initialSchedule: RezervoScheduleDTO;
    classPopularityIndex: ClassPopularityIndex;
};
