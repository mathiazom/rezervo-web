import { DateTime } from "luxon";

import { IntegrationIdentifier } from "@/lib/activeIntegrations";

export type IntegrationProfile = {
    identifier: IntegrationIdentifier;
    name: string;
    images: {
        light: {
            largeLogo: string;
        };
        dark: {
            largeLogo: string;
        };
        common: {
            smallLogo: string;
        };
    };
};

export type RezervoProvider<T> = {
    weekScheduleFetcher: (weekNumber: number) => Promise<T>;
    weekScheduleAdapter: (weekSchedule: T) => RezervoWeekSchedule;
};

export type RezervoIntegration<T> = {
    profile: IntegrationProfile;
    businessUnits: RezervoBusinessUnit[];
    provider: RezervoProvider<T>;
};

export type RezervoBusinessUnit = {
    name: string;
};

export type RezervoSchedule = { [weekOffset: number]: RezervoWeekSchedule };

export type RezervoWeekSchedule = RezervoDaySchedule[];

export type RezervoDaySchedule = {
    date: DateTime;
    classes: RezervoClass[];
};

export type RezervoClassBase = {
    id: number;
    location: {
        id: number;
        studio: string;
        room: string;
    };
    isBookable: boolean;
    isCancelled: boolean;
    totalSlots: number;
    availableSlots: number;
    waitingListCount: number;
    activity: RezervoActivity;
    instructors: string[];
};

export type RezervoClass = RezervoClassBase & {
    startTime: DateTime;
    endTime: DateTime;
};

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
