import { DateTime, Info, Settings } from "luxon";

import { RezervoClass } from "@/types/chain";

export const calculateMondayOffset = () => LocalizedDateTime.now().weekday - 1;

export const zeroIndexedWeekday = (oneIndexedWeekday: number): number => (oneIndexedWeekday + 6) % 7;

export const capitalizeFirstCharacter = (text: string) => {
    return `${text[0]!.toUpperCase()}${text.slice(1)}`;
};

export const getCapitalizedWeekday = (date: DateTime): string => {
    if (!date.isValid || date.weekdayLong === null) {
        throw new Error("Invalid date");
    }

    return capitalizeFirstCharacter(date.weekdayLong);
};

export const getCapitalizedWeekdays = (): string[] => {
    return Info.weekdays("long").map((weekday) => capitalizeFirstCharacter(weekday));
};

export function isClassInThePast(_class: RezervoClass): boolean {
    return _class.startTime < LocalizedDateTime.now();
}

export function sameDay(a: DateTime, b: DateTime): boolean {
    return a.startOf("day") <= b && b <= a.endOf("day");
}

export function isToday(date: DateTime) {
    return sameDay(date, LocalizedDateTime.now());
}

export function isDayPassed(date: DateTime) {
    return date.endOf("day") > LocalizedDateTime.now();
}

export function firstDateOfWeekByOffset(weekOffset: number): DateTime {
    return LocalizedDateTime.now()
        .startOf("day")
        .plus({ day: weekOffset * 7 - calculateMondayOffset() });
}

export function weekOffsetBetweenDates(date1: DateTime, date2: DateTime) {
    // luxon will adjust for DST when working with week units
    // (https://github.com/moment/luxon/blob/3.4.4/docs/zones.md#math-across-dsts)
    return Math.floor(date1.startOf("week").diff(date2.startOf("week"), "weeks").weeks);
}

export const LocalizedDateTime: typeof DateTime = (() => {
    Settings.defaultLocale = "no";
    Settings.defaultZone = "Europe/Oslo";
    return DateTime;
})();
