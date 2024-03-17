import { DateTime } from "luxon";

export type ChainIdentifier = string;

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

export type ChainProfile = {
    identifier: ChainIdentifier;
    name: string;
    images: ChainProfileImages;
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

export type RezervoInstructor = {
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
    id: string;
    location: {
        id: string;
        studio: string;
        room: string | null;
    };
    isBookable: boolean;
    isCancelled: boolean;
    cancelText: string | null;
    totalSlots: number | null;
    availableSlots: number | null;
    waitingListCount: number | null;
    activity: RezervoActivity;
    instructors: RezervoInstructor[];
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
    additionalInformation: string | null;
    color: string;
    image: string | null;
};

export type ChainPageParams = {
    chain: ChainIdentifier;
};

export type ActivityCategory = {
    name: string;
    color: string;
};

export enum BookingPopupAction {
    BOOK = "BOOK",
    CANCEL = "CANCEL",
}

export type BookingPopupState = {
    chain: ChainIdentifier;
    _class: RezervoClass;
    action: BookingPopupAction;
};
