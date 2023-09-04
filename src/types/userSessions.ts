export enum SessionStatus {
    BOOKED = "BOOKED",
    CONFIRMED = "CONFIRMED",
    WAITLIST = "WAITLIST",
    UNKNOWN = "UNKNOWN",
}

export enum StatusColors {
    ACTIVE = "#44b700",
    WAITLIST = "#b75f00",
    UNKNOWN = "#000",
}

export type UserNameSessionStatus = {
    is_self: boolean;
    user_name: string;
    status: SessionStatus;
};
export type UserSessionsIndex = {
    [classId: string]: UserNameSessionStatus[];
};
