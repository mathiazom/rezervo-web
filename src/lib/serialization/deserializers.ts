import { LocalizedDateTime } from "@/lib/helpers/date";
import {
    BaseUserSession,
    brandBaseUserSessionDTO,
    brandRezervoClassDTO,
    OpenApi,
    RezervoClass,
    RezervoClassDTO,
    RezervoDaySchedule,
    RezervoDayScheduleDTO,
    RezervoWeekSchedule,
    RezervoWeekScheduleDTO,
    WithLuxonTimes,
} from "@/types/openapi";

function withLuxonTimes<T extends { startTime: string; endTime: string }>(dto: T): WithLuxonTimes<T> {
    return {
        ...dto,
        startTime: LocalizedDateTime.fromISO(dto.startTime),
        endTime: LocalizedDateTime.fromISO(dto.endTime),
    };
}

export function deserializeClass(classDTO: OpenApi["RezervoClass"]): RezervoClass {
    return withLuxonTimes(brandRezervoClassDTO(classDTO));
}

function deserializeBrandedClass(classDTO: RezervoClassDTO): RezervoClass {
    return withLuxonTimes(classDTO);
}

function deserializeDaySchedule(dayScheduleDTO: RezervoDayScheduleDTO): RezervoDaySchedule {
    return {
        ...dayScheduleDTO,
        date: LocalizedDateTime.fromISO(dayScheduleDTO.date),
        classes: dayScheduleDTO.classes.map(deserializeBrandedClass),
    };
}

export function deserializeWeekSchedule(weekScheduleDTO: RezervoWeekScheduleDTO): RezervoWeekSchedule {
    return {
        locationIds: weekScheduleDTO.locationIds,
        days: weekScheduleDTO.days.map(deserializeDaySchedule),
    };
}

export function deserializeUserSessions(userSessionsDTO: OpenApi["BaseUserSession"][]): BaseUserSession[] {
    return userSessionsDTO.map(brandBaseUserSessionDTO).map((userSessionDTO) => ({
        ...userSessionDTO,
        classData: withLuxonTimes(userSessionDTO.classData),
    }));
}
