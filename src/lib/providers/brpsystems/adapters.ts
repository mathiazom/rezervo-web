import determineActivityCategory from "@/lib/helpers/activityCategorization";
import { firstDateOfWeekByOffset, LocalizedDateTime, zeroIndexedWeekday } from "@/lib/helpers/date";
import { DetailedBrpClass, DetailedBrpWeekSchedule } from "@/lib/providers/brpsystems/types";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/chain";

function brpToRezervoClass(brpClass: DetailedBrpClass): RezervoClass {
    const category = determineActivityCategory(brpClass.name, brpClass.externalMessage !== null);
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
        isCancelled: brpClass.cancelled,
        totalSlots: brpClass.slots.total,
        availableSlots: brpClass.slots.leftToBook,
        waitingListCount: brpClass.slots.inWaitingList ?? null,
        activity: {
            id: brpClass.groupActivityProduct.id,
            name: brpClass.groupActivityProduct.name.replace(/\s\(\d+\)$/, ""),
            category: category.name,
            color: category.color,
            description: brpClass.externalMessage === null ? brpClass.description : brpClass.externalMessage,
            image: brpClass.image,
        },
        instructors: brpClass.instructors.map((instructor) => instructor.name) || [],
        startTime: LocalizedDateTime.fromISO(brpClass.duration.start),
        endTime: LocalizedDateTime.fromISO(brpClass.duration.end),
    };
}

export function brpToRezervoWeekSchedule(
    brpWeekSchedule: DetailedBrpWeekSchedule,
    weekOffset: number,
): RezervoWeekSchedule {
    const firstDateOfWeek = firstDateOfWeekByOffset(weekOffset);
    const weekMap: { [weekday: number]: RezervoDaySchedule } = {};
    for (let i = 0; i < 7; i++) {
        weekMap[i] = { date: firstDateOfWeek.plus({ day: i }), classes: [] };
    }
    for (const brpClass of brpWeekSchedule) {
        const date = LocalizedDateTime.fromISO(brpClass.duration.start);
        weekMap[zeroIndexedWeekday(date.weekday)]?.classes.push(brpToRezervoClass(brpClass));
    }
    return Object.values(weekMap) as RezervoWeekSchedule;
}
