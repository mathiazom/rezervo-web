import { GROUP_BOOKING_URL } from "../config/config";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { ActivityPopularity } from "../types/derivedTypes";
import { determineClassPopularity } from "./popularity";
import { ClassConfig } from "../types/rezervoTypes";

function scheduleUrl(token: string, from: Date | null = null) {
    return (
        "https://ibooking.sit.no/webapp/api/Schedule/getSchedule" +
        `?token=${token}${from ? "&from=" + from.toISOString() : ""}` +
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

async function fetchScheduleWithDayOffset(token: string, dayOffset: number): Promise<SitSchedule> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + dayOffset);
    const scheduleResponse = await fetch(scheduleUrl(token, dayOffset === 0 ? null : startDate));
    if (!scheduleResponse.ok) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received status ${scheduleResponse.status}`
        );
    }
    return await scheduleResponse.json();
}

export async function fetchSchedule(weekOffset: number) {
    const token = await fetchPublicToken();

    const dayNumber = new Date().getDay();
    const mondayOffset = dayNumber === 0 ? 6 : dayNumber - 1;

    return {
        // Use two fetches to retrieve schedule for the next 7 days
        days: [
            // Use offset -1 to fetch all today's events, not just the ones in the future
            ...(await fetchScheduleWithDayOffset(token, -1 - mondayOffset + weekOffset * 7)).days.slice(1, 4),
            ...(await fetchScheduleWithDayOffset(token, 3 - mondayOffset + weekOffset * 7)).days.slice(0, 4),
        ],
    };
}

export async function fetchActivityPopularity(): Promise<ActivityPopularity[]> {
    const token = await fetchPublicToken();
    const firstBatch = await fetchScheduleWithDayOffset(token, -7);
    const secondBatch = await fetchScheduleWithDayOffset(token, -4);
    const previousSchedule = {
        days: [...firstBatch.days, ...secondBatch.days],
    };
    return previousSchedule.days.flatMap((day) =>
        day.classes.map((sitClass) => ({
            activityId: sitClass.activityId,
            popularity: determineClassPopularity(sitClass),
        }))
    );
}

export function classConfigRecurrentId(classConfig: ClassConfig) {
    return recurrentClassId(classConfig.activity, classConfig.weekday, classConfig.time.hour, classConfig.time.minute);
}

export function sitClassRecurrentId(sitClass: SitClass) {
    const d = new Date(sitClass.from);
    return recurrentClassId(sitClass.activityId, sitClass.weekday ?? -1, d.getHours(), d.getMinutes());
}

export function recurrentClassId(activityId: number, weekday: number, hour: number, minute: number) {
    return `${activityId}_${weekday}_${hour}_${minute}`;
}

export function destructRecurrentClassId(id: string): {
    activityId: number | undefined;
    weekday: number | undefined;
    hour: number | undefined;
    minute: number | undefined;
} {
    const [activityId, weekday, hour, minute] = id.split("_").map((s) => Number(s));
    return { activityId, weekday, hour, minute };
}
