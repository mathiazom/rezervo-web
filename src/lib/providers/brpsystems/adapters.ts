import determineActivityCategory from "@/lib/helpers/activityCategorization";
import { LocalizedDateTime, zeroIndexedWeekday } from "@/lib/helpers/date";
import { DetailedBrpClass, DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { RezervoClass, RezervoWeekSchedule } from "@/types/integration";

function brpToRezervoClass(brpClass: DetailedBrpClass): RezervoClass {
    const category = determineActivityCategory(brpClass.name);
    return {
        id: brpClass.id,
        location: {
            id: brpClass.businessUnit.id,
            studio: brpClass.businessUnit.name,
            room: brpClass.locations.map((location) => location.name).join(", "),
        },
        isBookable:
            LocalizedDateTime.fromISO(brpClass.bookableEarliest) < LocalizedDateTime.now() &&
            LocalizedDateTime.fromISO(brpClass.bookableLatest) > LocalizedDateTime.now(),
        totalSlots: brpClass.slots.total,
        availableSlots: brpClass.slots.leftToBook,
        waitingListCount: brpClass.slots.inWaitingList,
        activity: {
            id: brpClass.groupActivityProduct.id,
            name: brpClass.groupActivityProduct.name.replace(/\s\(\d+\)$/, ""),
            category: category.name,
            color: category.color,
            description: brpClass.description,
            image: brpClass.image,
        },
        instructors: brpClass.instructors.map((instructor) => instructor.name) || [],
        startTime: LocalizedDateTime.fromISO(brpClass.duration.start),
        endTime: LocalizedDateTime.fromISO(brpClass.duration.end),
    };
}

export function brpToRezervoWeekSchedule(brpWeekSchedule: DetailedBrpWeekSchedule): RezervoWeekSchedule {
    const schedule: RezervoWeekSchedule = [];
    for (const brpClass of brpWeekSchedule) {
        const date = LocalizedDateTime.fromISO(brpClass.duration.start);
        const weekday = zeroIndexedWeekday(date.weekday);
        if (schedule[weekday] === undefined) {
            schedule[weekday] = { date, classes: [] };
        }
        schedule[weekday]?.classes.push(brpToRezervoClass(brpClass));
    }
    return schedule;
}
