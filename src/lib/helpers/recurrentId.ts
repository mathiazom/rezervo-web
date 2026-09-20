import { ActivityId, RecurrentClassId, brandRecurrentClassId } from "@/types/brand";
import { ClassConfig, RezervoSessionClass } from "@/types/openapi";

export function classConfigRecurrentId(classConfig: ClassConfig): RecurrentClassId {
    return recurrentClassId(
        classConfig.activityId,
        classConfig.weekday,
        classConfig.startTime.hour,
        classConfig.startTime.minute,
    );
}

export function classRecurrentId(_class: RezervoSessionClass): RecurrentClassId {
    const { hour, minute, weekday } = _class.startTime;
    return recurrentClassId(_class.activity.id, (weekday + 6) % 7, hour, minute);
}

function recurrentClassId(activityId: ActivityId, weekday: number, hour: number, minute: number): RecurrentClassId {
    return brandRecurrentClassId(`${activityId}_${weekday}_${hour}_${minute}`);
}
