import { getDateTime } from "@/lib/integration/common";
import {
    RezervoClass,
    RezervoClassDTO,
    RezervoDaySchedule,
    RezervoDayScheduleDTO,
    RezervoSchedule,
    RezervoScheduleDTO,
    RezervoWeekSchedule,
    RezervoWeekScheduleDTO,
} from "@/types/rezervo";

function deserializeClass(classDTO: RezervoClassDTO): RezervoClass {
    return {
        ...classDTO,
        startTime: getDateTime(classDTO.startTime),
        endTime: getDateTime(classDTO.endTime),
    };
}

function deserializeDaySchedule(dayScheduleDTO: RezervoDayScheduleDTO): RezervoDaySchedule {
    return {
        date: getDateTime(dayScheduleDTO.date),
        classes: dayScheduleDTO.classes.map(deserializeClass),
    };
}

export function deserializeWeekSchedule(weekScheduleDTO: RezervoWeekScheduleDTO): RezervoWeekSchedule {
    return weekScheduleDTO.map(deserializeDaySchedule);
}
export function deserializeSchedule(scheduleDTO: RezervoScheduleDTO): RezervoSchedule {
    return Object.keys(scheduleDTO)
        .map((weekOffset) => {
            const weekSchedule = scheduleDTO[Number(weekOffset)];
            if (weekSchedule === undefined) {
                throw new Error(`Invalid week schedule for week offset ${weekOffset}`);
            }
            return {
                [Number(weekOffset)]: deserializeWeekSchedule(weekSchedule),
            };
        })
        .reduce((acc, next) => ({ ...acc, ...next }), {});
}

function serializeClass(_class: RezervoClass): RezervoClassDTO {
    return {
        ..._class,
        startTime: _class.startTime.toISO() ?? "",
        endTime: _class.endTime.toISO() ?? "",
    };
}
function serializeDaySchedule(daySchedule: RezervoDaySchedule): RezervoDayScheduleDTO {
    return {
        date: daySchedule.date.toISO() ?? "",
        classes: daySchedule.classes.map(serializeClass),
    };
}

export function serializeWeekSchedule(weekSchedule: RezervoWeekSchedule): RezervoWeekScheduleDTO {
    return weekSchedule.map((daySchedule) => serializeDaySchedule(daySchedule));
}
export function serializeSchedule(schedule: RezervoSchedule): RezervoScheduleDTO {
    return Object.keys(schedule)
        .map((weekOffset) => {
            const weekSchedule = schedule[Number(weekOffset)];
            if (weekSchedule === undefined) {
                throw new Error(`Invalid week schedule for week offset ${weekOffset}`);
            }
            return {
                [Number(weekOffset)]: serializeWeekSchedule(weekSchedule),
            };
        })
        .reduce((acc, next) => ({ ...acc, ...next }), {});
}
