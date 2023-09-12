import { LocalizedDateTime } from "@/lib/helpers/date";
import { IntegrationIdentifier } from "@/lib/integrations/active";
import { SitClass, SitDaySchedule, SitWeekSchedule } from "@/lib/integrations/sit/types";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/integration";

function convertToProperISO(sitDate: string): string {
    return sitDate.replace(" ", "T");
}

function sitToRezervoClass(sitClass: SitClass): RezervoClass {
    const startTime = convertToProperISO(sitClass.from);
    return {
        integration: IntegrationIdentifier.sit,
        id: sitClass.id,
        startTime: LocalizedDateTime.fromISO(startTime),
        endTime: LocalizedDateTime.fromISO(convertToProperISO(sitClass.to)),
        location: {
            id: sitClass.studio.id,
            studio: sitClass.studio.name,
            room: sitClass.room,
        },
        bookingOpensAt: LocalizedDateTime.fromISO(convertToProperISO(sitClass.bookingOpensAt)),
        bookingClosesAt: LocalizedDateTime.fromISO(startTime).minus({ minute: 5 }), // https://www.sit.no/content/trening-slik-booker-du
        totalSlots: sitClass.capacity,
        availableSlots: sitClass.available,
        waitingListCount: sitClass.waitlist.count,
        activity: {
            id: sitClass.activityId,
            name: sitClass.name,
            category: sitClass.category.name,
            description: sitClass.description,
            color: sitClass.color,
            image: sitClass.image,
        },
        instructors: sitClass.instructors.map((sitInstructor) => sitInstructor.name),
    };
}

function sitToRezervoDaySchedule(sitDaySchedule: SitDaySchedule): RezervoDaySchedule {
    return {
        date: LocalizedDateTime.fromISO(sitDaySchedule.date),
        classes: sitDaySchedule.classes.map(sitToRezervoClass),
    };
}

export function sitToRezervoWeekSchedule(sitWeekSchedule: SitWeekSchedule): RezervoWeekSchedule {
    return sitWeekSchedule.days.map(sitToRezervoDaySchedule);
}
