import { DateTime, HourNumbers, MinuteNumbers, WeekdayNumbers } from "luxon";

import { CheckInLocation } from "@/components/utils/CheckIn";
import { Schemas, WithLuxonTimes } from "@/types/api-helpers";

export type ChainIdentifier = string;

export type ChainProfile = Schemas["ChainProfile"];
export type RezervoChain = Schemas["ChainResponse"];
export type CheckInTerminal = Schemas["CheckInTerminal"];
export type RezervoInstructor = Schemas["RezervoInstructor"];

export interface RezervoWeekSchedule {
    locationIds: string[];
    days: RezervoDaySchedule[];
}

export type RezervoDaySchedule = Omit<Schemas["RezervoDay"], "date" | "classes"> & {
    date: DateTime;
    classes: RezervoClass[];
};

export type RezervoClass = WithLuxonTimes<Schemas["RezervoClass"]>;
export type RezervoSessionClass = WithLuxonTimes<Schemas["SessionRezervoClass"]>;

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
