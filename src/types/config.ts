import { Schemas } from "@/types/api-helpers";

export type ClassConfig = Schemas["Class"];

export type ChainConfig = Schemas["ChainConfig"];

export type ChainConfigPayload = Schemas["BaseChainConfig"];

export type ChainUserPayload = Schemas["ChainUserCredentials"];

export type ChainUserTotpPayload = Schemas["ChainUserTOTPPayload"];

export type HourAndMinute = Schemas["HourAndMinute"];

export type AllowedTimeWindow = Schemas["AllowedTimeWindowConfig"];

export type NotificationsConfig = Schemas["Notifications"];

export type PreferencesPayload = Schemas["UserPreferences"];

export type UserNameWithIsSelf = Schemas["UserIdAndNameWithIsSelf"];
