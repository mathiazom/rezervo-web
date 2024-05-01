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
        .map((compactISOWeek) => {
            const weekSchedule = scheduleDTO[compactISOWeek];
            if (weekSchedule === undefined) {
                throw new Error(`Invalid week schedule for week ${compactISOWeek}`);
            }
            return {
                [compactISOWeek]: deserializeWeekSchedule(weekSchedule),
            };
        })
        .reduce((acc, next) => ({ ...acc, ...next }), {});
}

export function deserializeUserSessions(userSessionsDTO: BaseUserSessionDTO[]): BaseUserSession[] {
    return userSessionsDTO.map((userSessionDTO) => ({
        ...userSessionDTO,
        classData: deserializeClass(userSessionDTO.classData),
    }));
}
