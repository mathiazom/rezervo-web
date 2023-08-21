import { SitClass } from "./integration/sit";

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

export type UserNameWithIsSelf = {
    is_self: boolean;
    user_name: string;
};

export type AllConfigsIndex = {
    [recurrentClassId: string]: UserNameWithIsSelf[];
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

export enum IntegrationIdentifier {
    sit = "sit",
    fsc = "fsc",
}

export type RezervoIntegration<T> = {
    name: string;
    acronym: IntegrationIdentifier;
    businessUnits: RezervoBusinessUnit<T>[];
};

export type RezervoBusinessUnit<T> = {
    name: string;
    // eslint-disable-next-line no-unused-vars
    weekScheduleFetcher: (weekNumber: number) => Promise<T>;
    // eslint-disable-next-line no-unused-vars
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule;
};

export type RezervoSchedule = { [weekOffset: number]: RezervoWeekSchedule };

export type RezervoWeekSchedule = RezervoDaySchedule[];

export type RezervoDaySchedule = {
    date: string;
    classes: RezervoClass[];
};

// This will eventually be implemented as its own type, but for now it ports to SitClass
export type RezervoClass = SitClass;

export type IntegrationPageProps = {
    initialSchedule: RezervoSchedule;
    classPopularityIndex: ClassPopularityIndex;
};
