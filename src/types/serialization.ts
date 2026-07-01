import { Schemas } from "@/types/api-helpers";
import { ChainProfile } from "@/types/chain";

export type RezervoWeekScheduleDTO = Schemas["RezervoSchedule"] & { locationIds: string[] };

export type RezervoDayScheduleDTO = Schemas["RezervoDay"];

export type RezervoClassDTO = Schemas["RezervoClass"];

export type BaseUserSessionDTO = Schemas["BaseUserSession"];

export interface IndexPageProps {
    chainProfiles: ChainProfile[];
}
