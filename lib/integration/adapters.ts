import { SitClass, SitDaySchedule, SitWeekSchedule } from "../../types/integration/sit";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "../../types/rezervo";

function sitToRezervoClass(sitClass: SitClass): RezervoClass {
    return {
        id: sitClass.id,
        activityId: sitClass.activityId,
        available: sitClass.available,
        bookable: sitClass.bookable,
        capacity: sitClass.capacity,
        studio: sitClass.studio,
        room: sitClass.room,
        from: sitClass.from,
        to: sitClass.to,
        name: sitClass.name,
        description: sitClass.description,
        category: sitClass.category,
        image: sitClass.image,
        color: sitClass.color,
        instructors: sitClass.instructors,
        waitlist: sitClass.waitlist,
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
