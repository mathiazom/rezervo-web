import { DateTime } from "luxon";

import { determineActivityCategory, getDateTime, zeroIndexedWeekday } from "@/lib/integration/common";
import { DetailedFscClass, DetailedFscWeekSchedule } from "@/types/integration/fsc";
import { SitClass, SitDaySchedule, SitWeekSchedule } from "@/types/integration/sit";
import { IntegrationIdentifier, RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/rezervo";

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

function fscToRezervoClass(fscClass: DetailedFscClass): RezervoClass {
    const category = determineActivityCategory(fscClass.name);
    return {
        integration: IntegrationIdentifier.fsc,
        id: fscClass.id,
        location: {
            id: fscClass.businessUnit.id,
            studio: fscClass.businessUnit.name,
            room: fscClass.locations.map((location) => location.name).join(", "),
        },
        isBookable:
            getDateTime(fscClass.bookableEarliest) < DateTime.now() &&
            getDateTime(fscClass.bookableLatest) > DateTime.now(),
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
        startTime: getDateTime(fscClass.duration.start),
        endTime: getDateTime(fscClass.duration.end),
    };
}

export function fscToRezervoWeekSchedule(fscWeekSchedule: DetailedFscWeekSchedule): RezervoWeekSchedule {
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
