import { DateTime } from "luxon";

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

export type IntegrationConfig = {
    active: boolean;
    classes: ClassConfig[];
};
export type IntegrationConfigPayload = IntegrationConfig;

export type NotificationsConfig = {
    reminder_hours_before: number | null;
    push_notification_subscription: PushSubscription | null;
};

export type Preferences = {
    notifications: NotificationsConfig | null;
};

export type PreferencesPayload = Preferences;

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
    weekScheduleFetcher: (weekNumber: number) => Promise<T>;
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule;
};

export type RezervoSchedule = { [weekOffset: number]: RezervoWeekSchedule };
export type RezervoScheduleDTO = { [weekOffset: number]: RezervoWeekScheduleDTO };

export type RezervoWeekSchedule = RezervoDaySchedule[];
export type RezervoWeekScheduleDTO = RezervoDayScheduleDTO[];

export type RezervoDaySchedule = {
    date: DateTime;
    classes: RezervoClass[];
};
export type RezervoDayScheduleDTO = {
    date: string;
    classes: RezervoClassDTO[];
};

interface RezervoClassBase {
    integration: IntegrationIdentifier;
    id: number;
    location: {
        id: number;
        studio: string;
        room: string;
    };
    isBookable: boolean;
    totalSlots: number;
    availableSlots: number;
    waitingListCount: number;
    activity: RezervoActivity;
    instructors: string[];
}
export interface RezervoClass extends RezervoClassBase {
    startTime: DateTime;
    endTime: DateTime;
}
export interface RezervoClassDTO extends RezervoClassBase {
    startTime: string;
    endTime: string;
}

export type RezervoActivity = {
    id: number;
    name: string;
    category: string;
    description: string;
    color: string;
    image: string | null;
};

export type IntegrationPageParams = {
    integration: IntegrationIdentifier;
};

export type IntegrationPageProps = {
    integration: IntegrationIdentifier;
    initialSchedule: RezervoScheduleDTO;
    classPopularityIndex: ClassPopularityIndex;
};
