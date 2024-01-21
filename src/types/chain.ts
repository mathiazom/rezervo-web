import { DateTime } from "luxon";

import { ChainIdentifier } from "@/lib/activeChains";

export type ChainProfileImages = {
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

export type BaseChainProfile = {
    identifier: ChainIdentifier;
    name: string;
};

export type ChainProfileExtras = {
    images: ChainProfileImages;
};

export type ChainProfile = BaseChainProfile & ChainProfileExtras;

export type BaseRezervoChain = {
    profile: BaseChainProfile;
    branches: RezervoBranch[];
};

export type RezervoChainExtras = {
    profile: ChainProfileExtras;
};

export type RezervoChain = {
    profile: ChainProfile;
    branches: RezervoBranch[];
};

export type RezervoBranch = {
    identifier: string;
    name: string;
    locations: RezervoLocation[];
};

export type RezervoLocation = {
    identifier: string;
    name: string;
};

export type RezervoSchedule = {
    [weekOffset: number]: RezervoWeekSchedule;
};

export type RezervoWeekSchedule = {
    locationIds: string[];
    days: RezervoDaySchedule[];
};

export type RezervoDaySchedule = {
    date: DateTime;
    classes: RezervoClass[];
};

export type RezervoClassBase = {
    id: number;
    location: {
        id: string;
        studio: string;
        room: string;
    };
    isBookable: boolean;
    isCancelled: boolean;
    totalSlots: number;
    availableSlots: number;
    waitingListCount: number | null;
    activity: RezervoActivity;
    instructors: {
        name: string;
    }[];
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
