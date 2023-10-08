import { calculateMondayOffset, LocalizedDateTime } from "@/lib/helpers/date";
import { IBookingDaySchedule, IBookingDomain, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";

function iBookingScheduleUrl(token: string, fromISO: string | null = null, domain: IBookingDomain) {
    return (
        `https://ibooking.${domain}.no/webapp/api/Schedule/getSchedule` +
        `?token=${token}${fromISO ? "&from=" + fromISO : ""}` +
        "&studios=306,307,308,402,540,1132&lang=no&categories=5,6,7,8,9,10,11,12,14"
    );
}

const SIT_GROUP_BOOKING_URL = "https://www.sit.no/trening/gruppe";

function fetchIBookingPublicToken() {
    return fetch(SIT_GROUP_BOOKING_URL)
        .then((res) => res.text())
        .then((text) => text.replace(/[\n\r]/g, "").replace(/\s+/g, " "))
        .then((soup) => {
            const matches = soup.match(/<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/);
            return matches && matches.length > 1 ? String(matches[1]) : "";
        });
}

async function fetchIBookingDaySchedulesWithOffset(
    token: string,
    dayOffset: number,
    domain: IBookingDomain,
): Promise<{ days: IBookingDaySchedule[] }> {
    const startDate = LocalizedDateTime.now().plus({ day: dayOffset });
    const scheduleResponse = await fetch(iBookingScheduleUrl(token, startDate.toISODate(), domain));
    if (!scheduleResponse.ok) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received status ${scheduleResponse.status}`,
        );
    }
    return await scheduleResponse.json();
}

export async function fetchIBookingWeekSchedule(
    weekOffset: number,
    domain: IBookingDomain,
): Promise<IBookingWeekSchedule> {
    const token = await fetchIBookingPublicToken();
    const mondayOffset = calculateMondayOffset();

    return {
        // Use two fetches to retrieve schedule for the next 7 days
        days: [
            // Use offset -1 to fetch all today's events, not just the ones in the future
            ...(
                await fetchIBookingDaySchedulesWithOffset(token, -1 - mondayOffset + weekOffset * 7, domain)
            ).days.slice(1, 4),
            ...(await fetchIBookingDaySchedulesWithOffset(token, 3 - mondayOffset + weekOffset * 7, domain)).days.slice(
                0,
                4,
            ),
        ],
    };
}
