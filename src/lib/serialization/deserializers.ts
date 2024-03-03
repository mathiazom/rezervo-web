import { LocalizedDateTime } from "@/lib/helpers/date";
import { RezervoClass, RezervoDaySchedule, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import {
    RezervoClassDTO,
    RezervoDayScheduleDTO,
    RezervoScheduleDTO,
    RezervoWeekScheduleDTO,
    BaseUserSessionDTO,
} from "@/types/serialization";
import { BaseUserSession } from "@/types/userSessions";

function deserializeClass(classDTO: RezervoClassDTO): RezervoClass {
    return {
        ...classDTO,
        startTime: LocalizedDateTime.fromISO(classDTO.startTime),
        endTime: LocalizedDateTime.fromISO(classDTO.endTime),
    };
}

function deserializeDaySchedule(dayScheduleDTO: RezervoDayScheduleDTO): RezervoDaySchedule {
    return {
        date: LocalizedDateTime.fromISO(dayScheduleDTO.date),
        classes: dayScheduleDTO.classes.map(deserializeClass),
    };
}

export function deserializeWeekSchedule(weekScheduleDTO: RezervoWeekScheduleDTO): RezervoWeekSchedule {
    return {
        locationIds: weekScheduleDTO.locationIds,
        days: weekScheduleDTO.days.map(deserializeDaySchedule),
    };
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

export function deserializeUserSessions(userSessionsDTO: BaseUserSessionDTO[]): BaseUserSession[] {
    return userSessionsDTO.map((userSessionDTO) => ({
        ...userSessionDTO,
        class_data: deserializeClass(userSessionDTO.class_data),
    }));
}
