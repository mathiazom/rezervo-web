import { ChainIdentifier, RezervoClass } from "@/types/chain";
import { UserNameWithIsSelf } from "@/types/config";

export enum SessionStatus {
    PLANNED = "PLANNED",
    BOOKED = "BOOKED",
    CONFIRMED = "CONFIRMED",
    NOSHOW = "NOSHOW",
    WAITLIST = "WAITLIST",
    UNKNOWN = "UNKNOWN",
}

export enum StatusColors {
    ACTIVE = "#44b700",
    WAITLIST = "#b75f00",
    UNKNOWN = "#000",
}

export type UserNameSessionStatus = UserNameWithIsSelf & {
    status: SessionStatus;
    positionInWaitList: number | null;
};
export type UserSessionsIndex = Record<string, UserNameSessionStatus[]>;

export interface BaseUserSession {
    chain: ChainIdentifier;
    status: SessionStatus;
    positionInWaitList: number | null;
    classData: RezervoClass;
}
