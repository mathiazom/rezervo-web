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

export type ChainConfig = {
    active: boolean;
    classes: ClassConfig[];
};
export type ChainConfigPayload = ChainConfig;

export type ChainUser = {
    username: string;
};

export type ChainUserPayload = ChainUser & {
    password: string;
};

export type NotificationsConfig = {
    reminder_hours_before: number | null;
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
