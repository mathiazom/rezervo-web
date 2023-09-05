import { ClassConfig } from "@/types/config";
import { RezervoClass } from "@/types/integration";

export function classConfigRecurrentId(classConfig: ClassConfig) {
    return recurrentClassId(classConfig.activity, classConfig.weekday, classConfig.time.hour, classConfig.time.minute);
}

export function classRecurrentId(_class: RezervoClass) {
    const { hour, minute, weekday } = _class.startTime;
    return recurrentClassId(_class.activity.id, (weekday + 6) % 7, hour, minute);
}

export function recurrentClassId(activityId: number, weekday: number, hour: number, minute: number) {
    return `${activityId}_${weekday}_${hour}_${minute}`;
}
