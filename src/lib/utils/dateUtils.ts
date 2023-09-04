import { DateTime } from "luxon";

import { LOCALE, TIME_ZONE } from "@/lib/consts";

export const calculateMondayOffset = () => DateTime.now().setZone(TIME_ZONE).weekday - 1;

export const getDateTime = (date: string): DateTime => DateTime.fromISO(date, { zone: TIME_ZONE, locale: LOCALE });

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
