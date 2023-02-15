import { GROUP_BOOKING_URL } from "../config/config";
import { SitSchedule } from "../types/sitTypes";
import { ActivityPopularity } from "../types/derivedTypes";
import { determineClassPopularity } from "./popularity";

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
            const matches = soup.match(
                /<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/
            );
            return matches && matches.length > 1 ? String(matches[1]) : "";
        });
}

async function fetchScheduleWithDayOffset(
    token: string,
    dayOffset: number
): Promise<SitSchedule> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + dayOffset);
    const scheduleResponse = await fetch(
        scheduleUrl(token, dayOffset === 0 ? null : startDate)
    );
    if (!scheduleResponse.ok) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received status ${scheduleResponse.status}`
        );
    }
    return await scheduleResponse.json();
}

export async function fetchSchedule() {
    const token = await fetchPublicToken();
    // Use two fetches to retrieve schedule for the next 8 days
    const firstBatch = await fetchScheduleWithDayOffset(token, 0);
    const secondBatch = await fetchScheduleWithDayOffset(token, 4);
    return { days: [...firstBatch.days, ...secondBatch.days] };
}

export async function fetchPreviousActivities(): Promise<ActivityPopularity[]> {
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
