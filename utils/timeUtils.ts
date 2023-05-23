export function simpleTimeStringFromISO(isoString: string) {
    return isoString.split("T")[1]?.slice(0, 5);
}

const WEEKDAY_NAME_NUMBER_ENTRIES: [string, number][] = [
    ["Mandag", 0],
    ["Tirsdag", 1],
    ["Onsdag", 2],
    ["Torsdag", 3],
    ["Fredag", 4],
    ["Lørdag", 5],
    ["Søndag", 6],
];

export const WEEKDAY_NAME_TO_NUMBER = new Map(WEEKDAY_NAME_NUMBER_ENTRIES);

export const WEEKDAY_NUMBER_TO_NAME = new Map(WEEKDAY_NAME_NUMBER_ENTRIES.map(([name, number]) => [number, name]));

export function weekdayNameToNumber(weekdayName: string): number {
    const weekdayNumber = WEEKDAY_NAME_TO_NUMBER.get(weekdayName);

    if (weekdayNumber === undefined) {
        throw new Error("weekdayName not found");
    }

    return weekdayNumber;
}
