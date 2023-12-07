import { DateTime } from "luxon";

import { ChainIdentifier } from "@/lib/activeChains";

export type ChainProfile = {
    identifier: ChainIdentifier;
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

export type RezervoProviderFetcher<T> = (weekOffset: number) => Promise<T>;

export type RezervoProviderAdapter<T> = (weekSchedule: T, weekOffset: number) => RezervoWeekSchedule;

export type RezervoProvider<T> = {
    weekScheduleFetcher: RezervoProviderFetcher<T>;
    weekScheduleAdapter: RezervoProviderAdapter<T>;
};

export type RezervoChain<T> = {
    profile: ChainProfile;
    branches: RezervoBranch[];
    provider: RezervoProvider<T>;
};

export type RezervoBranch = {
    name: string;
    locations: RezervoLocation[];
};

export type RezervoLocation = {
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
    waitingListCount: number | null;
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

export type ChainPageParams = {
    chain: ChainIdentifier;
};
