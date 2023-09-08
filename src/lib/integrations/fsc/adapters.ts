import determineActivityCategory from "@/lib/helpers/activityCategorization";
import { getLocalizedDateTime, zeroIndexedWeekday } from "@/lib/helpers/date";
import { IntegrationIdentifier } from "@/lib/integrations/active";
import { DetailedFscClass, DetailedFscWeekSchedule } from "@/lib/integrations/fsc/types";
import { RezervoClass, RezervoWeekSchedule } from "@/types/integration";

function fscToRezervoClass(fscClass: DetailedFscClass): RezervoClass {
    const category = determineActivityCategory(fscClass.name);
    const localizedDateTime = getLocalizedDateTime();
    return {
        integration: IntegrationIdentifier.fsc,
        id: fscClass.id,
        location: {
            id: fscClass.businessUnit.id,
            studio: fscClass.businessUnit.name,
            room: fscClass.locations.map((location) => location.name).join(", "),
        },
        isBookable:
            localizedDateTime.fromISO(fscClass.bookableEarliest) < localizedDateTime.now() &&
            localizedDateTime.fromISO(fscClass.bookableLatest) > localizedDateTime.now(),
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
        startTime: localizedDateTime.fromISO(fscClass.duration.start),
        endTime: localizedDateTime.fromISO(fscClass.duration.end),
    };
}

export function fscToRezervoWeekSchedule(fscWeekSchedule: DetailedFscWeekSchedule): RezervoWeekSchedule {
    const schedule: RezervoWeekSchedule = [];
    for (const fscClass of fscWeekSchedule) {
        const date = getLocalizedDateTime().fromISO(fscClass.duration.start);
        const weekday = zeroIndexedWeekday(date.weekday);
        if (schedule[weekday] === undefined) {
            schedule[weekday] = { date, classes: [] };
        }
        schedule[weekday]?.classes.push(fscToRezervoClass(fscClass));
    }
    return schedule;
}
