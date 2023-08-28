import { SitClass, SitDaySchedule, SitWeekSchedule } from "../../types/integration/sit";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "../../types/rezervo";

function sitToRezervoClass(sitClass: SitClass): RezervoClass {
    return {
        id: sitClass.id,
        activityId: sitClass.activityId,
        startTimeISO: sitClass.from,
        endTimeISO: sitClass.to,
        location: {
            id: sitClass.studio.id,
            studio: sitClass.studio.name,
            room: sitClass.room,
        },
        isBookable: sitClass.bookable,
        totalSlots: sitClass.capacity,
        availableSlots: sitClass.available,
        waitingList: {
            count: sitClass.waitlist.count,
            userPosition: sitClass.waitlist.userPosition,
        },
        name: sitClass.name,
        description: sitClass.description,
        category: sitClass.category,
        image: sitClass.image,
        color: sitClass.color,
        instructors: sitClass.instructors,
        weekday: sitClass.weekday,
    };
}

function sitToRezervoDaySchedule(sitDaySchedule: SitDaySchedule): RezervoDaySchedule {
    return {
        date: sitDaySchedule.date,
        classes: sitDaySchedule.classes.map(sitToRezervoClass),
    };
}

export function sitToRezervoWeekSchedule(sitWeekSchedule: SitWeekSchedule): RezervoWeekSchedule {
    return sitWeekSchedule.days.map(sitToRezervoDaySchedule);
}
