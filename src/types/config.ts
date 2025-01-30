export interface ClassTimeConfig {
    hour: number;
    minute: number;
}

export interface ClassConfig {
    activityId: string;
    locationId: string;
    weekday: number;
    startTime: ClassTimeConfig;
    displayName: string;
}

export interface ChainConfig {
    active: boolean;
    recurringBookings: ClassConfig[];
}
export type ChainConfigPayload = ChainConfig;

export interface ChainUser {
    username: string;
}

export type ChainUserProfile = ChainUser & {
    isAuthVerified: boolean;
};

export type ChainUserPayload = ChainUser & {
    password: string;
};

export interface ChainUserTotpPayload {
    totp: string;
}

export interface NotificationsConfig {
    reminderHoursBefore: number | null;
}

export interface Preferences {
    notifications: NotificationsConfig | null;
}

export type PreferencesPayload = Preferences;

export interface UserNameWithIsSelf {
    isSelf: boolean;
    userId: string;
    userName: string;
}

export type AllConfigsIndex = Record<string, UserNameWithIsSelf[]>;
