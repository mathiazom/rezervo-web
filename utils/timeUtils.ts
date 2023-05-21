export function simpleTimeStringFromISO(isoString: string) {
    return isoString.split(/[\s,T]/)[1]?.slice(0, 5);
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

// In Mathias we trust
export function getWeekNumber(d: Date): number {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
