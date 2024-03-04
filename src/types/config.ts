export type ClassTimeConfig = {
    hour: number;
    minute: number;
};

export type ClassConfig = {
    activityId: string;
    locationId: string;
    weekday: number;
    startTime: ClassTimeConfig;
    displayName: string;
};

export type ChainConfig = {
    active: boolean;
    recurringBookings: ClassConfig[];
};
export type ChainConfigPayload = ChainConfig;

export type ChainUser = {
    username: string;
};

export type ChainUserPayload = ChainUser & {
    password: string;
};

export type NotificationsConfig = {
    reminderHoursBefore: number | null;
};

export type Preferences = {
    notifications: NotificationsConfig | null;
};

export type PreferencesPayload = Preferences;

export type UserNameWithIsSelf = {
    isSelf: boolean;
    userId: string;
    userName: string;
};

export type AllConfigsIndex = {
    [recurrentClassId: string]: UserNameWithIsSelf[];
};
