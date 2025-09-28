import { DateTime, Info, Settings } from "luxon";
// @ts-expect-error bad internal import
// eslint-disable-next-line import-x/no-unresolved
import { IfValid, Valid } from "luxon/src/_util";

import { ExcludeClassTimeFilter, ExcludeClassTimeFiltersType, RezervoClass } from "@/types/chain";

export const compactISOWeekString = <IsValid extends boolean>(
    date: DateTime<IsValid>,
): IfValid<string, null, IsValid> =>
    date.toISOWeekDate()?.replace("-", "").slice(0, 7) as IfValid<string, null, IsValid>;

export const fromCompactISOWeekString = (weekString: string) =>
    LocalizedDateTime.fromObject({
        weekYear: Number.parseInt(weekString.slice(0, 4)),
        weekNumber: Number.parseInt(weekString.slice(5, 7)),
    });

export const calculateMondayOffset = (date: DateTime<true>) => date.weekday - 1;

export const zeroIndexedWeekday = (oneIndexedWeekday: number): number => (oneIndexedWeekday + 6) % 7;

export const capitalizeFirstCharacter = (text: string) => {
    const first = text[0];
    if (first === undefined) return "";
    return `${first.toUpperCase()}${text.slice(1)}`;
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

export function firstDateOfWeekByOffset(reference: DateTime<Valid>, weekOffset: number): DateTime<Valid> {
    return reference.startOf("day").plus({ day: weekOffset * 7 - calculateMondayOffset(reference) });
}

export const LocalizedDateTime: typeof DateTime = (() => {
    Settings.defaultLocale = "no";
    Settings.defaultZone = "Europe/Oslo";
    return DateTime;
})();

export const isClassExcludedByTimeFilters = (
    _class: RezervoClass,
    excludeClassTimeFilters: ExcludeClassTimeFiltersType,
): boolean => {
    if (!excludeClassTimeFilters.enabled) {
        return false;
    }
    return excludeClassTimeFilters.filters.some((filter) => {
        return isClassExcludedByTimeFilter(_class, filter);
    });
};

export const isClassExcludedByTimeFilter = (
    _class: RezervoClass,
    excludeClassTimeFilter: ExcludeClassTimeFilter,
): boolean => {
    if (!excludeClassTimeFilter.enabled) {
        return false;
    }

    if (
        _class.startTime.weekday !== excludeClassTimeFilter.weekday &&
        _class.endTime.weekday !== excludeClassTimeFilter.weekday
    ) {
        return false;
    }

    // Include a check for the middle value, in case of entirely overlapping exclude-filter
    const middle = _class.startTime.plus(_class.endTime.minus(_class.startTime.toMillis()).toMillis() / 2);
    return [_class.startTime, _class.endTime, middle].some((candidateTime) => {
        const startTime = candidateTime.set({
            hour: excludeClassTimeFilter.startHour,
            minute: excludeClassTimeFilter.startMinute,
        });
        const endTime = candidateTime.set({
            hour: excludeClassTimeFilter.endHour,
            minute: excludeClassTimeFilter.endMinute,
        });

        return candidateTime > startTime && candidateTime < endTime;
    });
};
