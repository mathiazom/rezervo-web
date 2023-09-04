import { IntegrationIdentifier } from "@/lib/integrations/active";
import { SitClass, SitDaySchedule, SitWeekSchedule } from "@/lib/integrations/sit/types";
import { getDateTime } from "@/lib/utils/dateUtils";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/rezervo";

function sitToRezervoClass(sitClass: SitClass): RezervoClass {
    return {
        integration: IntegrationIdentifier.sit,
        id: sitClass.id,
        startTime: getDateTime(sitClass.from.replace(" ", "T")), // convert to proper ISO8601
        endTime: getDateTime(sitClass.to.replace(" ", "T")), // convert to proper ISO8601
        location: {
            id: sitClass.studio.id,
            studio: sitClass.studio.name,
            room: sitClass.room,
        },
        isBookable: sitClass.bookable,
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
        date: getDateTime(sitDaySchedule.date),
        classes: sitDaySchedule.classes.map(sitToRezervoClass),
    };
}

export function sitToRezervoWeekSchedule(sitWeekSchedule: SitWeekSchedule): RezervoWeekSchedule {
    return sitWeekSchedule.days.map(sitToRezervoDaySchedule);
}
