import { DateTime } from "luxon";

import { calculateMondayOffset, LocalizedDateTime } from "@/lib/helpers/date";
import { IntegrationIdentifier } from "@/lib/providers/active";
import {
    DetailedBrpClass,
    DetailedBrpWeekSchedule,
    BrpActivityDetail,
    BrpClass,
    BrpWeekSchedule,
} from "@/lib/providers/brpsystems/types";

function brpWeekScheduleUrl(fromDate: DateTime, integration: IntegrationIdentifier) {
    return `https://${integration}.brpsystems.com/brponline/api/ver3/businessunits/8/groupactivities?period.start=${fromDate.toUTC()}&period.end=${fromDate
        .plus({ week: 1 })
        .toUTC()}`;
}

function brpActivityDetailUrl(activityId: number, integration: IntegrationIdentifier) {
    return `https://${integration}.brpsystems.com/brponline/api/ver3/products/groupactivities/${activityId}`;
}

async function fetchActivityDetail(activityId: number, integration: IntegrationIdentifier) {
    return fetch(brpActivityDetailUrl(activityId, integration)).then(async (response: Response) => {
        if (!response.ok) {
            throw new Error(
                `Failed to fetch class detail for ${integration} class with id ${activityId}, received status ${response.status}`,
            );
        }

        const groupActivityDetail: BrpActivityDetail = await response.json();

        return groupActivityDetail;
    });
}

function toDetailedBrpClass(brpClass: BrpClass, brpActivityDetail: BrpActivityDetail): DetailedBrpClass {
    return {
        ...brpClass,
        description: brpActivityDetail.description,
        // The images have lower resolution further back in the assets list.
        // Index 2 seems like a good balance between resolution and load time
        image: brpActivityDetail.assets?.at(2)?.contentUrl ?? "",
    };
}

async function fetchDetailedBrpWeekSchedule(
    brpWeekSchedule: BrpWeekSchedule,
    integration: IntegrationIdentifier,
): Promise<DetailedBrpWeekSchedule> {
    const fetchPromises: Map<number, Promise<BrpActivityDetail>> = new Map();

    return Promise.all(
        brpWeekSchedule.map(async (brpClass) => {
            const activityId = brpClass.groupActivityProduct.id;
            if (!fetchPromises.has(activityId)) {
                fetchPromises.set(activityId, fetchActivityDetail(activityId, integration));
            }

            const brpActivityDetail = await fetchPromises.get(activityId);

            if (brpActivityDetail === undefined) {
                throw new Error(`Failed to fetch activity detail for activity with id ${activityId}`);
            }

            return toDetailedBrpClass(brpClass, brpActivityDetail);
        }),
    );
}

export async function fetchBrpWeekSchedule(
    weekOffset: number,
    integration: IntegrationIdentifier,
): Promise<DetailedBrpWeekSchedule> {
    const startDate = LocalizedDateTime.now()
        .startOf("day")
        .plus({ day: weekOffset * 7 - calculateMondayOffset() });
    const response = await fetch(brpWeekScheduleUrl(startDate, integration));
    if (!response.ok) {
        throw new Error(`Failed to fetch schedule with startDate ${startDate}, received status ${response.status}`);
    }
    const brpWeekSchedule: BrpWeekSchedule = await response.json();
    return fetchDetailedBrpWeekSchedule(brpWeekSchedule, integration);
}
