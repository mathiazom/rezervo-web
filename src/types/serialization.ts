import { RezervoError } from "@/types/errors";
import { IntegrationProfile, RezervoClassBase } from "@/types/integration";
import { ClassPopularityIndex } from "@/types/popularity";

export type RezervoScheduleDTO = { [weekOffset: number]: RezervoWeekScheduleDTO };
export type RezervoWeekScheduleDTO = RezervoDayScheduleDTO[];
export type RezervoDayScheduleDTO = {
    date: string;
    classes: RezervoClassDTO[];
};
export type RezervoClassDTO = RezervoClassBase & {
    bookingOpensAt: string;
    bookingClosesAt: string;
    startTime: string;
    endTime: string;
};

export type IntegrationPageProps = {
    integrationProfile: IntegrationProfile;
    initialSchedule: RezervoScheduleDTO;
    classPopularityIndex: ClassPopularityIndex;
    error?: RezervoError;
};
