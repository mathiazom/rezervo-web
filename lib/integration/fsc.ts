import { DateTime } from "luxon";
import { TIME_ZONE } from "../../config/config";
import { GroupActivitiesResponse, WeekSchedule } from "../../types/integration/fsc";
import { calculateMondayOffset } from "./common";

function scheduleUrl(fromDate: DateTime) {
    return `https://fsc.no/api/v1/businessunits/8/groupactivities?period_start=${fromDate.toUTC()}&period_end=${fromDate
        .plus({ week: 1 })
        .toUTC()}`;
}

export async function fetchWeekSchedule(weekOffset: number): Promise<WeekSchedule> {
    const startDate = DateTime.now()
        .setZone(TIME_ZONE)
        .startOf("day")
        .plus({ day: weekOffset * 7 - calculateMondayOffset() });
    const groupActivitiesResponse = await fetch(scheduleUrl(startDate));
    if (!groupActivitiesResponse.ok) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received status ${groupActivitiesResponse.status}`
        );
    }
    const responseData: GroupActivitiesResponse = await groupActivitiesResponse.json();
    if (!responseData.success) {
        throw new Error(`Failed to fetch schedule with startDate ${startDate}, received errors ${responseData.errors}`);
    }
    return responseData.data;
}
