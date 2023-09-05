import { DateTime } from "luxon";

import { RezervoClass } from "@/types/integration";

export const calculateMondayOffset = () => DateTime.now().weekday - 1;

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

export function isClassInThePast(_class: RezervoClass): boolean {
    return _class.startTime < DateTime.now();
}
