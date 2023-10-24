import { RezervoClass, RezervoDaySchedule, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import {
    RezervoClassDTO,
    RezervoDayScheduleDTO,
    RezervoScheduleDTO,
    RezervoWeekScheduleDTO,
} from "@/types/serialization";

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
