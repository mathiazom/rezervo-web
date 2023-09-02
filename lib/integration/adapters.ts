import { DateTime } from "luxon";

import { getDateTime, zeroIndexedWeekday } from "lib/integration/common";
import { FscClass, FscWeekSchedule } from "types/integration/fsc";
import { SitClass, SitDaySchedule, SitWeekSchedule } from "types/integration/sit";
import { IntegrationIdentifier, RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "types/rezervo";
import { hexColorHash } from "utils/colorUtils";

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
        waitingList: {
            count: sitClass.waitlist.count,
            userPosition: sitClass.waitlist.userPosition,
        },
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

function fscToRezervoClass(fscClass: FscClass): RezervoClass {
    return {
        integration: IntegrationIdentifier.fsc,
        id: fscClass.id,
        location: {
            id: fscClass.businessUnit.id,
            studio: fscClass.businessUnit.name,
            room: fscClass.locations.map((location) => location.name).join(", "),
        },
        isBookable:
            DateTime.fromISO(fscClass.bookableEarliest) < DateTime.now() &&
            DateTime.fromISO(fscClass.bookableLatest) > DateTime.now(),
        totalSlots: fscClass.slots.total,
        availableSlots: fscClass.slots.leftToBook,
        waitingList: {
            count: fscClass.slots.inWaitingList,
            userPosition: null, // TODO: missing here
        },
        activity: {
            id: fscClass.groupActivityProduct.id,
            name: fscClass.groupActivityProduct.name,
            category: "FSC", // FSC does not seem to have categories
            color: hexColorHash(fscClass.locations.map((location) => location.name).join(", ")),
            description: "", // TODO: available at 'https://fsc.no/api/v1/products/groupactivities/{fscClass.groupActivityProduct.id}'
            image: null, // TODO: available at 'https://fsc.no/api/v1/products/groupactivities/{fscClass.groupActivityProduct.id}'
        },
        instructors: fscClass.instructors.map((instructor) => instructor.name),
        startTime: getDateTime(fscClass.duration.start),
        endTime: getDateTime(fscClass.duration.end),
    };
}

export function fscToRezervoWeekSchedule(fscWeekSchedule: FscWeekSchedule): RezervoWeekSchedule {
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
