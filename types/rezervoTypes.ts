export type ClassTimeConfig = {
    hour: number;
    minute: number;
};

export type ClassConfig = {
    activity: number;
    display_name: string;
    weekday: number;
    studio: number;
    time: ClassTimeConfig;
};

export type NotificationsConfig = {
    reminder_hours_before: number | null;
};

export type UserConfig = {
    active: boolean;
    classes: ClassConfig[];
    notifications: NotificationsConfig | null;
};
export type ConfigPayload = UserConfig;

export type PeerConfig = {
    peer_name: string;
    classes: ClassConfig[];
};

export type PeerClassesIndex = {
    [recurrentClassId: string]: string[];
};

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

export enum ClassPopularity {
    Unknown = "Denne timen gikk ikke forrige uke, og har derfor ukjent popularitet.",
    Low = "Denne timen har vanligvis mange ledige plasser.",
    Medium = "Denne timen har vanligvis noen ledige plasser.",
    High = "Denne timen er vanligvis full.",
}

export type ClassPopularityIndex = {
    [recurrentId: string]: ClassPopularity;
};
