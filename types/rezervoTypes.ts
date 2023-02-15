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
