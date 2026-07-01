import { Schemas } from "@/types/api-helpers";
import { RezervoSessionClass } from "@/types/chain";

export type SessionStatus = Schemas["SessionState"];

export const SessionStatus = {
    PLANNED: "PLANNED",
    BOOKED: "BOOKED",
    CONFIRMED: "CONFIRMED",
    NOSHOW: "NOSHOW",
    WAITLIST: "WAITLIST",
    UNKNOWN: "UNKNOWN",
} as const satisfies Record<string, SessionStatus>;

export enum StatusColors {
    ACTIVE = "#44b700",
    WAITLIST = "#b75f00",
    UNKNOWN = "#000",
}

export type BaseUserSession = Omit<Schemas["BaseUserSession"], "classData"> & {
    classData: RezervoSessionClass;
};
