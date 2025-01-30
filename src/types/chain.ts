import { DateTime, HourNumbers, MinuteNumbers, WeekdayNumbers } from "luxon";

import { CheckInLocation } from "@/components/utils/CheckIn";

export type ChainIdentifier = string;

export interface ChainProfileImages {
    light: {
        largeLogo: string;
    };
    dark: {
        largeLogo: string;
    };
    common: {
        smallLogo: string;
    };
}

export interface ChainProfile {
    identifier: ChainIdentifier;
    name: string;
    images: ChainProfileImages;
}

export interface RezervoChain {
    profile: ChainProfile;
    branches: RezervoBranch[];
}

export interface RezervoBranch {
    identifier: string;
    name: string;
    locations: RezervoLocation[];
}

export interface CheckInTerminal {
    id: string;
    label: string;
    hasPrinter: boolean;
}

export interface RezervoLocation {
    identifier: string;
    name: string;
    checkInTerminals: CheckInTerminal[];
}

export interface RezervoInstructor {
    name: string;
}

export type RezervoSchedule = Record<string, RezervoWeekSchedule>;

export interface RezervoWeekSchedule {
    locationIds: string[];
    days: RezervoDaySchedule[];
}

export interface RezervoDaySchedule {
    date: DateTime;
    classes: RezervoClass[];
}

export interface RezervoClassBase {
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
}

export type RezervoClass = RezervoClassBase & {
    startTime: DateTime;
    endTime: DateTime;
};

export interface RezervoActivity {
    id: number;
    name: string;
    category: string;
    description: string;
    additionalInformation: string | null;
    color: string;
    image: string | null;
}

export interface ChainPageParams {
    chain: ChainIdentifier;
}

export interface ActivityCategory {
    name: string;
    color: string;
}

export enum BookingPopupAction {
    BOOK = "BOOK",
    CANCEL = "CANCEL",
}

export interface BookingPopupState {
    chain: ChainIdentifier;
    _class: RezervoClass;
    action: BookingPopupAction;
}

export interface ExcludeClassTimeFilter {
    weekday: WeekdayNumbers;
    startHour: HourNumbers;
    startMinute: MinuteNumbers;
    endHour: HourNumbers;
    endMinute: MinuteNumbers;
    enabled: boolean;
}

export interface ExcludeClassTimeFiltersType {
    enabled: boolean;
    filters: ExcludeClassTimeFilter[];
}

export interface CheckInConfiguration {
    previousLocation: CheckInLocation | undefined;
    previousTerminal: CheckInTerminal | undefined;
}
