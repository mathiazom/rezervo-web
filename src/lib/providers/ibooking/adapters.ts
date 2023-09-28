import { LocalizedDateTime } from "@/lib/helpers/date";
import { IntegrationIdentifier } from "@/lib/providers/active";
import { IBookingClass, IBookingDaySchedule, IBookingWeekSchedule } from "@/lib/providers/ibooking/types";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/integration";

function iBookingToRezervoClass(iBookingClass: IBookingClass, integration: IntegrationIdentifier): RezervoClass {
    return {
        integration,
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

function iBookingToRezervoDaySchedule(
    iBookingDaySchedule: IBookingDaySchedule,
    integration: IntegrationIdentifier,
): RezervoDaySchedule {
    return {
        date: LocalizedDateTime.fromISO(iBookingDaySchedule.date),
        classes: iBookingDaySchedule.classes.map((iBookingClass) => iBookingToRezervoClass(iBookingClass, integration)),
    };
}

export function iBookingToRezervoWeekSchedule(
    iBookingWeekSchedule: IBookingWeekSchedule,
    integration: IntegrationIdentifier,
): RezervoWeekSchedule {
    return iBookingWeekSchedule.days.map((iBookingDaySchedule) =>
        iBookingToRezervoDaySchedule(iBookingDaySchedule, integration),
    );
}
