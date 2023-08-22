import { DateTime } from "luxon";

import { TIME_ZONE } from "../../config/config";
import { FscWeekSchedule, FscWeekScheduleResponse } from "../../types/integration/fsc";
import { calculateMondayOffset } from "./common";

function fscWeekScheduleUrl(fromDate: DateTime) {
    return `https://fsc.no/api/v1/businessunits/8/groupactivities?period_start=${fromDate.toUTC()}&period_end=${fromDate
        .plus({ week: 1 })
        .toUTC()}`;
}

export async function fetchFscWeekSchedule(weekOffset: number): Promise<FscWeekSchedule> {
    const startDate = DateTime.now()
        .setZone(TIME_ZONE)
        .startOf("day")
        .plus({ day: weekOffset * 7 - calculateMondayOffset() });
    const response = await fetch(fscWeekScheduleUrl(startDate));
    if (!response.ok) {
        throw new Error(`Failed to fetch schedule with startDate ${startDate}, received status ${response.status}`);
    }
    const fscWeekScheduleResponse: FscWeekScheduleResponse = await response.json();
    if (!fscWeekScheduleResponse.success) {
        throw new Error(
            `Failed to fetch schedule with startDate ${startDate}, received errors ${fscWeekScheduleResponse.errors}`
        );
    }
    return fscWeekScheduleResponse.data;
}
