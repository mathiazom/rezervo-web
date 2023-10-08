import { LocalizedDateTime } from "@/lib/helpers/date";
import { IBookingClass, IBookingDaySchedule, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/integration";

function iBookingToRezervoClass(iBookingClass: IBookingClass): RezervoClass {
    return {
        id: iBookingClass.id,
        startTime: LocalizedDateTime.fromISO(iBookingClass.from.replace(" ", "T")), // convert to proper ISO8601
        endTime: LocalizedDateTime.fromISO(iBookingClass.to.replace(" ", "T")), // convert to proper ISO8601
        location: {
            id: iBookingClass.studio.id,
            studio: iBookingClass.studio.name,
            room: iBookingClass.room,
        },
        isBookable: iBookingClass.bookable,
        totalSlots: iBookingClass.capacity,
        availableSlots: iBookingClass.available,
        waitingListCount: iBookingClass.waitlist.count,
        activity: {
            id: iBookingClass.activityId,
            name: iBookingClass.name,
            category: iBookingClass.category.name,
            description: iBookingClass.description,
            color: iBookingClass.color,
            image: iBookingClass.image,
        },
        instructors: iBookingClass.instructors.map((iBookingInstructor) => iBookingInstructor.name),
    };
}

function iBookingToRezervoDaySchedule(iBookingDaySchedule: IBookingDaySchedule): RezervoDaySchedule {
    return {
        date: LocalizedDateTime.fromISO(iBookingDaySchedule.date),
        classes: iBookingDaySchedule.classes.map((iBookingClass) => iBookingToRezervoClass(iBookingClass)),
    };
}

export function iBookingToRezervoWeekSchedule(iBookingWeekSchedule: IBookingWeekSchedule): RezervoWeekSchedule {
    return iBookingWeekSchedule.days.map((iBookingDaySchedule) => iBookingToRezervoDaySchedule(iBookingDaySchedule));
}
