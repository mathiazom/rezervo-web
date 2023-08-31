import { GROUP_BOOKING_URL, TIME_ZONE } from "config/config";
import { calculateMondayOffset } from "lib/integration/common";
import { DateTime } from "luxon";
import { SitDaySchedule, SitWeekSchedule } from "types/integration/sit";

function sitScheduleUrl(token: string, fromISO: string | null = null) {
    return (
        "https://ibooking.sit.no/webapp/api/Schedule/getSchedule" +
        `?token=${token}${fromISO ? "&from=" + fromISO : ""}` +
        "&studios=306,307,308,402,540,1132&lang=no&categories=5,6,7,8,9,10,11,12,14"
    );
}

function fetchSitPublicToken() {
    return fetch(GROUP_BOOKING_URL)
        .then((res) => res.text())
        .then((text) => text.replace(/[\n\r]/g, "").replace(/\s+/g, " "))
        .then((soup) => {
            const matches = soup.match(/<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/);
            return matches && matches.length > 1 ? String(matches[1]) : "";
        });
}

async function fetchSitDaySchedulesWithOffset(token: string, dayOffset: number): Promise<{ days: SitDaySchedule[] }> {
    const startDate = DateTime.now().setZone(TIME_ZONE).plus({ day: dayOffset });
    const scheduleResponse = await fetch(sitScheduleUrl(token, startDate.toISODate()));
    if (!scheduleResponse.ok) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received status ${scheduleResponse.status}`,
        );
    }
    return await scheduleResponse.json();
}

export async function fetchSitWeekSchedule(weekOffset: number): Promise<SitWeekSchedule> {
    const token = await fetchSitPublicToken();
    const mondayOffset = calculateMondayOffset();

    return {
        // Use two fetches to retrieve schedule for the next 7 days
        days: [
            // Use offset -1 to fetch all today's events, not just the ones in the future
            ...(await fetchSitDaySchedulesWithOffset(token, -1 - mondayOffset + weekOffset * 7)).days.slice(1, 4),
            ...(await fetchSitDaySchedulesWithOffset(token, 3 - mondayOffset + weekOffset * 7)).days.slice(0, 4),
        ],
    };
}
