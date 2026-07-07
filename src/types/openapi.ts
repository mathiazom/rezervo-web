import { DateTime } from "luxon";

import type { components } from "@/types/api";

type OpenApi = components["schemas"];

export type WithLuxonTimes<T extends { startTime: string; endTime: string }> = Omit<T, "startTime" | "endTime"> & {
    startTime: DateTime;
    endTime: DateTime;
};

export type ChainProfile = OpenApi["ChainProfile"];
export type RezervoChain = OpenApi["ChainResponse"];
export type ActivityCategory = OpenApi["RezervoBaseCategory"];
export type CheckInTerminal = OpenApi["CheckInTerminal"];
export type RezervoInstructor = OpenApi["RezervoInstructor"];
export type ClassConfig = OpenApi["Class"];
export type ChainConfig = OpenApi["ChainConfig"];
export type ChainConfigPayload = OpenApi["BaseChainConfig"];
export type ChainUserPayload = OpenApi["ChainUserCredentials"];
export type ChainUserTotpPayload = OpenApi["ChainUserTOTPPayload"];
export type HourAndMinute = OpenApi["HourAndMinute"];
export type AllowedTimeWindow = OpenApi["AllowedTimeWindowConfig"];
export type NotificationsConfig = OpenApi["Notifications"];
export type PreferencesPayload = OpenApi["UserPreferences"];
export type UserNameWithIsSelf = OpenApi["UserIdAndNameWithIsSelf"];
export type Features = OpenApi["Features"];
export type CommunityUser = OpenApi["CommunityUser"];
export type PushNotificationSubscription = OpenApi["PushNotificationSubscription"];
export type RezervoClassDTO = OpenApi["RezervoClass"];
export type RezervoDayScheduleDTO = OpenApi["RezervoDay"];
export type BaseUserSessionDTO = OpenApi["BaseUserSession"];
export type RezervoWeekScheduleDTO = OpenApi["RezervoSchedule"] & { locationIds: string[] };
export type RezervoClass = WithLuxonTimes<OpenApi["RezervoClass"]>;
export type RezervoSessionClass = WithLuxonTimes<OpenApi["SessionRezervoClass"]>;

export type RezervoDaySchedule = Omit<OpenApi["RezervoDay"], "date" | "classes"> & {
    date: DateTime;
    classes: RezervoClass[];
};

export interface RezervoWeekSchedule {
    locationIds: string[];
    days: RezervoDaySchedule[];
}

export type BaseUserSession = Omit<OpenApi["BaseUserSession"], "classData"> & {
    classData: RezervoSessionClass;
};

export type SessionStatus = OpenApi["SessionState"];

export const SessionStatus = {
    PLANNED: "PLANNED",
    BOOKED: "BOOKED",
    CONFIRMED: "CONFIRMED",
    NOSHOW: "NOSHOW",
    WAITLIST: "WAITLIST",
    UNKNOWN: "UNKNOWN",
} as const satisfies Record<string, SessionStatus>;

export type UserRelationship = OpenApi["UserRelationship"];

export const UserRelationship = {
    UNKNOWN: "UNKNOWN",
    REQUEST_SENT: "REQUEST_SENT",
    REQUEST_RECEIVED: "REQUEST_RECEIVED",
    FRIEND: "FRIEND",
} as const satisfies Record<string, UserRelationship>;

export type UserRelationshipAction = OpenApi["UserRelationshipAction"];

export const UserRelationshipAction = {
    ADD_FRIEND: "ADD_FRIEND",
    ACCEPT_FRIEND: "ACCEPT_FRIEND",
    DENY_FRIEND: "DENY_FRIEND",
    REMOVE_FRIEND: "REMOVE_FRIEND",
} as const satisfies Record<string, UserRelationshipAction>;
