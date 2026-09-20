import { DateTime } from "luxon";

import type { components } from "@/types/api";
import {
    brandActivityId,
    brandBranchId,
    brandChainId,
    brandClassId,
    brandLocationId,
    brandTerminalId,
    brandUserId,
    type ActivityId,
    type BranchId,
    type ChainId,
    type ClassId,
    type LocationId,
    type TerminalId,
    type UserId,
} from "@/types/brand";

export type OpenApi = components["schemas"];

export type WithLuxonTimes<T extends { startTime: string; endTime: string }> = Omit<T, "startTime" | "endTime"> & {
    startTime: DateTime;
    endTime: DateTime;
};

export type ChainProfile = Omit<OpenApi["ChainProfile"], "identifier"> & { identifier: ChainId };

export type CheckInTerminal = Omit<OpenApi["CheckInTerminal"], "id"> & { id: TerminalId };

export type RezervoLocation = Omit<OpenApi["BaseLocation"], "identifier" | "checkInTerminals"> & {
    identifier: LocationId;
    checkInTerminals: CheckInTerminal[] | null;
};

export type RezervoBranch = Omit<OpenApi["BranchProfile"], "identifier" | "locations"> & {
    identifier: BranchId;
    locations: RezervoLocation[];
};

export type RezervoChain = Omit<OpenApi["ChainResponse"], "profile" | "branches"> & {
    profile: ChainProfile;
    branches: RezervoBranch[];
};

export type ActivityCategory = OpenApi["RezervoBaseCategory"];
export type RezervoInstructor = OpenApi["RezervoInstructor"];
export type ClassConfig = Omit<OpenApi["Class"], "activityId" | "locationId"> & {
    activityId: ActivityId;
    locationId: LocationId;
};
export type ChainConfig = Omit<OpenApi["ChainConfig"], "chain" | "recurringBookings"> & {
    chain: ChainId;
    recurringBookings: ClassConfig[];
};
export type ChainConfigPayload = Omit<OpenApi["BaseChainConfig"], "recurringBookings"> & {
    recurringBookings: ClassConfig[];
};
export type ChainUserPayload = OpenApi["ChainUserCredentials"];
export type ChainUserTotpPayload = OpenApi["ChainUserTOTPPayload"];
export type HourAndMinute = OpenApi["HourAndMinute"];
export type AllowedTimeWindow = OpenApi["AllowedTimeWindowConfig"];
export type NotificationsConfig = OpenApi["Notifications"];
export type PreferencesPayload = OpenApi["UserPreferences"];
export type UserNameWithIsSelf = Omit<OpenApi["UserIdAndNameWithIsSelf"], "userId"> & { userId: UserId };
export type UserSessionStatus = Omit<OpenApi["UserNameSessionStatus"], "userId"> & { userId: UserId };
export type Features = OpenApi["Features"];
export type CommunityUser = Omit<OpenApi["CommunityUser"], "userId"> & { userId: UserId };
export type PushNotificationSubscription = OpenApi["PushNotificationSubscription"];

type BrandedScheduleClass<
    T extends { id: string; location: OpenApi["RezervoLocation"]; activity: OpenApi["RezervoActivity"] },
> = Omit<T, "id" | "location" | "activity"> & {
    id: ClassId;
    location: Omit<T["location"], "id"> & { id: LocationId };
    activity: Omit<T["activity"], "id"> & { id: ActivityId };
};

export type RezervoClassDTO = BrandedScheduleClass<OpenApi["RezervoClass"]>;
export type RezervoDayScheduleDTO = Omit<OpenApi["RezervoDay"], "classes"> & { classes: RezervoClassDTO[] };
export type SessionRezervoClassDTO = BrandedScheduleClass<OpenApi["SessionRezervoClass"]>;
export type BaseUserSessionDTO = Omit<OpenApi["BaseUserSession"], "chain" | "classData"> & {
    chain: ChainId;
    classData: SessionRezervoClassDTO;
};
export type RezervoWeekScheduleDTO = Omit<OpenApi["RezervoSchedule"], "days"> & {
    days: RezervoDayScheduleDTO[];
    locationIds: LocationId[];
};
export type RezervoClass = WithLuxonTimes<RezervoClassDTO>;
export type RezervoSessionClass = WithLuxonTimes<SessionRezervoClassDTO>;

export type RezervoDaySchedule = Omit<RezervoDayScheduleDTO, "date" | "classes"> & {
    date: DateTime;
    classes: RezervoClass[];
};

export interface RezervoWeekSchedule {
    locationIds: LocationId[];
    days: RezervoDaySchedule[];
}

export type BaseUserSession = Omit<BaseUserSessionDTO, "classData"> & {
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

function brandCheckInTerminal(terminal: OpenApi["CheckInTerminal"]): CheckInTerminal {
    return { ...terminal, id: brandTerminalId(terminal.id) };
}

function brandRezervoLocation(location: OpenApi["BaseLocation"]): RezervoLocation {
    return {
        ...location,
        identifier: brandLocationId(location.identifier),
        checkInTerminals: location.checkInTerminals?.map(brandCheckInTerminal) ?? null,
    };
}

export function brandRezervoChain(chain: OpenApi["ChainResponse"]): RezervoChain {
    return {
        profile: { ...chain.profile, identifier: brandChainId(chain.profile.identifier) },
        branches: chain.branches.map((branch) => ({
            ...branch,
            identifier: brandBranchId(branch.identifier),
            locations: branch.locations.map(brandRezervoLocation),
        })),
    };
}

export function brandClassConfig(classConfig: OpenApi["Class"]): ClassConfig {
    return {
        ...classConfig,
        activityId: brandActivityId(classConfig.activityId),
        locationId: brandLocationId(classConfig.locationId),
    };
}

export function brandChainConfigPayload(chainConfigPayload: OpenApi["BaseChainConfig"]): ChainConfigPayload {
    return {
        ...chainConfigPayload,
        recurringBookings: chainConfigPayload.recurringBookings.map(brandClassConfig),
    };
}

export function brandChainConfig(chainConfig: OpenApi["ChainConfig"]): ChainConfig {
    return { ...brandChainConfigPayload(chainConfig), chain: brandChainId(chainConfig.chain) };
}

export function brandRezervoClassDTO(classDTO: OpenApi["RezervoClass"]): RezervoClassDTO {
    return {
        ...classDTO,
        id: brandClassId(classDTO.id),
        location: { ...classDTO.location, id: brandLocationId(classDTO.location.id) },
        activity: { ...classDTO.activity, id: brandActivityId(classDTO.activity.id) },
    };
}

function brandSessionRezervoClassDTO(classDTO: OpenApi["SessionRezervoClass"]): SessionRezervoClassDTO {
    return {
        ...classDTO,
        id: brandClassId(classDTO.id),
        location: { ...classDTO.location, id: brandLocationId(classDTO.location.id) },
        activity: { ...classDTO.activity, id: brandActivityId(classDTO.activity.id) },
    };
}

export function brandBaseUserSessionDTO(userSessionDTO: OpenApi["BaseUserSession"]): BaseUserSessionDTO {
    return {
        ...userSessionDTO,
        chain: brandChainId(userSessionDTO.chain),
        classData: brandSessionRezervoClassDTO(userSessionDTO.classData),
    };
}

export function brandCommunityUser(communityUser: OpenApi["CommunityUser"]): CommunityUser {
    return { ...communityUser, userId: brandUserId(communityUser.userId) };
}

function brandUserNameWithIsSelf(user: OpenApi["UserIdAndNameWithIsSelf"]): UserNameWithIsSelf {
    return { ...user, userId: brandUserId(user.userId) };
}

function brandUserSessionStatus(user: OpenApi["UserNameSessionStatus"]): UserSessionStatus {
    return { ...user, userId: brandUserId(user.userId) };
}

export function brandAllConfigsIndex(
    index: Record<string, OpenApi["UserIdAndNameWithIsSelf"][]>,
): Record<string, UserNameWithIsSelf[]> {
    return Object.fromEntries(Object.entries(index).map(([key, users]) => [key, users.map(brandUserNameWithIsSelf)]));
}

export function brandUserSessionsIndex(
    index: Record<string, OpenApi["UserNameSessionStatus"][]>,
): Record<string, UserSessionStatus[]> {
    return Object.fromEntries(Object.entries(index).map(([key, users]) => [key, users.map(brandUserSessionStatus)]));
}

export function brandRezervoWeekScheduleDTO(
    schedule: OpenApi["RezervoSchedule"],
    locationIds: LocationId[],
): RezervoWeekScheduleDTO {
    return {
        locationIds,
        days: schedule.days.map((day) => ({ ...day, classes: day.classes.map(brandRezervoClassDTO) })),
    };
}
