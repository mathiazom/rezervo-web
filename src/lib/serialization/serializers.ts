import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/chain";
import { RezervoClassDTO, RezervoDayScheduleDTO, RezervoWeekScheduleDTO } from "@/types/serialization";

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
    return {
        locationIds: weekSchedule.locationIds,
        days: weekSchedule.days.map((daySchedule) => serializeDaySchedule(daySchedule)),
    };
}
