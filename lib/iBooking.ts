import { GROUP_BOOKING_URL, TIME_ZONE } from "../config/config";
import { SitClass, SitWeekSchedule } from "../types/integration/sit";
import { ClassConfig } from "../types/rezervoTypes";
import { weekdayNameToNumber } from "../utils/timeUtils";
import { DateTime } from "luxon";
import { calculateMondayOffset } from "./integration/common";

function scheduleUrl(token: string, fromISO: string | null = null) {
    return (
        "https://ibooking.sit.no/webapp/api/Schedule/getSchedule" +
        `?token=${token}${fromISO ? "&from=" + fromISO : ""}` +
        "&studios=306,307,308,402,540,1132&lang=no&categories=5,6,7,8,9,10,11,12,14"
    );
}

function fetchPublicToken() {
    return fetch(GROUP_BOOKING_URL)
        .then((res) => res.text())
        .then((text) => text.replace(/[\n\r]/g, "").replace(/\s+/g, " "))
        .then((soup) => {
            const matches = soup.match(/<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/);
            return matches && matches.length > 1 ? String(matches[1]) : "";
        });
}

async function fetchScheduleWithDayOffset(token: string, dayOffset: number): Promise<SitWeekSchedule> {
    const startDate = DateTime.now().setZone(TIME_ZONE).plus({ day: dayOffset });
    const scheduleResponse = await fetch(scheduleUrl(token, startDate.toISODate()));
    if (!scheduleResponse.ok) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received status ${scheduleResponse.status}`
        );
    }
    return await scheduleResponse.json();
}

export async function fetchSchedules(weekOffsets: number[]): Promise<{ [weekOffset: number]: SitWeekSchedule }> {
    const weekOffsetToSchedule = (o: number) => fetchSchedule(o).then((s) => ({ [o]: s }));
    return (await Promise.all(weekOffsets.map(weekOffsetToSchedule))).reduce((acc, o) => ({ ...acc, ...o }), {});
}

export async function fetchSchedule(weekOffset: number): Promise<SitWeekSchedule> {
    const token = await fetchPublicToken();
    const mondayOffset = calculateMondayOffset();

    return {
        // Use two fetches to retrieve schedule for the next 7 days
        days: [
            // Use offset -1 to fetch all today's events, not just the ones in the future
            ...(await fetchScheduleWithDayOffset(token, -1 - mondayOffset + weekOffset * 7)).days.slice(1, 4),
            ...(await fetchScheduleWithDayOffset(token, 3 - mondayOffset + weekOffset * 7)).days.slice(0, 4),
        ].map((day) => ({
            ...day,
            classes: day.classes.map((_class) => ({
                ..._class,
                from: _class.from.replace(" ", "T"), // convert to proper ISO8601
                to: _class.to.replace(" ", "T"), // convert to proper ISO8601
                weekday: weekdayNameToNumber(day.dayName),
            })),
        })),
    };
}

export function classConfigRecurrentId(classConfig: ClassConfig) {
    return recurrentClassId(classConfig.activity, classConfig.weekday, classConfig.time.hour, classConfig.time.minute);
}

export function sitClassRecurrentId(sitClass: SitClass) {
    const { hour, minute } = DateTime.fromISO(sitClass.from);
    return recurrentClassId(sitClass.activityId, sitClass.weekday ?? -1, hour, minute);
}

export function recurrentClassId(activityId: number, weekday: number, hour: number, minute: number) {
    return `${activityId}_${weekday}_${hour}_${minute}`;
}

export function isClassInThePast(_class: SitClass): boolean {
    return DateTime.fromISO(_class.from, { zone: TIME_ZONE }) < DateTime.now();
}
