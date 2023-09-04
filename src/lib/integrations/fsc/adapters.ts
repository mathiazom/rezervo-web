import { DateTime } from "luxon";

import { IntegrationIdentifier } from "@/lib/integrations/active";
import { determineActivityCategory } from "@/lib/integrations/common";
import { DetailedFscClass, DetailedFscWeekSchedule } from "@/lib/integrations/fsc/types";
import { getDateTime, zeroIndexedWeekday } from "@/lib/utils/dateUtils";
import { RezervoClass, RezervoWeekSchedule } from "@/types/rezervo";

function fscToRezervoClass(fscClass: DetailedFscClass): RezervoClass {
    const category = determineActivityCategory(fscClass.name);
    return {
        integration: IntegrationIdentifier.fsc,
        id: fscClass.id,
        location: {
            id: fscClass.businessUnit.id,
            studio: fscClass.businessUnit.name,
            room: fscClass.locations.map((location) => location.name).join(", "),
        },
        isBookable:
            getDateTime(fscClass.bookableEarliest) < DateTime.now() &&
            getDateTime(fscClass.bookableLatest) > DateTime.now(),
        totalSlots: fscClass.slots.total,
        availableSlots: fscClass.slots.leftToBook,
        waitingListCount: fscClass.slots.inWaitingList,
        activity: {
            id: fscClass.groupActivityProduct.id,
            name: fscClass.groupActivityProduct.name.replace(/\s\(\d+\)$/, ""),
            category: category.name,
            color: category.color,
            description: fscClass.description,
            image: fscClass.image,
        },
        instructors: fscClass.instructors.map((instructor) => instructor.name),
        startTime: getDateTime(fscClass.duration.start),
        endTime: getDateTime(fscClass.duration.end),
    };
}

export function fscToRezervoWeekSchedule(fscWeekSchedule: DetailedFscWeekSchedule): RezervoWeekSchedule {
    const schedule: RezervoWeekSchedule = [];
    for (const fscClass of fscWeekSchedule) {
        const date = getDateTime(fscClass.duration.start);
        const weekday = zeroIndexedWeekday(date.weekday);
        if (schedule[weekday] === undefined) {
            schedule[weekday] = { date, classes: [] };
        }
        schedule[weekday]?.classes.push(fscToRezervoClass(fscClass));
    }
    return schedule;
}
