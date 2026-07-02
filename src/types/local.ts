import { HourNumbers, MinuteNumbers, WeekdayNumbers } from "luxon";
import { type CheckInTerminal, RezervoClass } from "@/types/openapi";
import type { CheckInLocation } from "@/components/utils/CheckIn";

export interface ActivityCategory {
    name: string;
    color: string;
}

export enum BookingPopupAction {
    BOOK = "BOOK",
    CANCEL = "CANCEL",
}

export interface BookingPopupState {
    chain: string;
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
