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
    weekScheduleFetcher: (weekNumber: number) => Promise<T>;
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule;
};

export type RezervoSchedule = { [weekOffset: number]: RezervoWeekSchedule };

export type RezervoWeekSchedule = RezervoDaySchedule[];

export type RezervoDaySchedule = {
    date: string;
    classes: RezervoClass[];
};

export type RezervoClass = {
    id: number;
    activityId: number;
    startTimeISO: string;
    endTimeISO: string;
    location: {
        id: number;
        studio: string;
        room: string;
    };
    isBookable: boolean;
    totalSlots: number;
    availableSlots: number;
    waitingList: {
        count: number;
        userPosition: number | null;
    };
    name: string;
    description: string;
    category: {
        id: string;
        name: string;
    };
    image: string;
    color: string;
    instructors: {
        id: number;
        name: string;
    }[];
    weekday: number | undefined;
};

export type IntegrationPageProps = {
    initialSchedule: RezervoSchedule;
    classPopularityIndex: ClassPopularityIndex;
};
