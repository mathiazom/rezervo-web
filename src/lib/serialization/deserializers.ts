import { LocalizedDateTime } from "@/lib/helpers/date";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/chain";
import {
    BaseUserSessionDTO,
    RezervoClassDTO,
    RezervoDayScheduleDTO,
    RezervoWeekScheduleDTO,
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

export function deserializeUserSessions(userSessionsDTO: BaseUserSessionDTO[]): BaseUserSession[] {
    return userSessionsDTO.map((userSessionDTO) => ({
        ...userSessionDTO,
        classData: deserializeClass(userSessionDTO.classData),
    }));
}
