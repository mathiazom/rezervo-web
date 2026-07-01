import { WithLuxonTimes } from "@/types/api-helpers";
import { LocalizedDateTime } from "@/lib/helpers/date";
import { RezervoClass, RezervoDaySchedule, RezervoWeekSchedule } from "@/types/chain";
import {
    BaseUserSessionDTO,
    RezervoClassDTO,
    RezervoDayScheduleDTO,
    RezervoWeekScheduleDTO,
} from "@/types/serialization";
import { BaseUserSession } from "@/types/userSessions";

function withLuxonTimes<T extends { startTime: string; endTime: string }>(dto: T): WithLuxonTimes<T> {
    return {
        ...dto,
        startTime: LocalizedDateTime.fromISO(dto.startTime),
        endTime: LocalizedDateTime.fromISO(dto.endTime),
    };
}

export function deserializeClass(classDTO: RezervoClassDTO): RezervoClass {
    return withLuxonTimes(classDTO);
}

function deserializeDaySchedule(dayScheduleDTO: RezervoDayScheduleDTO): RezervoDaySchedule {
    return {
        ...dayScheduleDTO,
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
        classData: withLuxonTimes(userSessionDTO.classData),
    }));
}
