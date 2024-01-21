import { RezervoClass } from "@/types/chain";
import { ClassConfig } from "@/types/config";

export function classConfigRecurrentId(classConfig: ClassConfig) {
    return recurrentClassId(
        classConfig.activityId,
        classConfig.weekday,
        classConfig.startTime.hour,
        classConfig.startTime.minute,
    );
}

export function classRecurrentId(_class: RezervoClass) {
    const { hour, minute, weekday } = _class.startTime;
    return recurrentClassId(_class.activity.id.toString(), (weekday + 6) % 7, hour, minute);
}

export function recurrentClassId(activityId: string, weekday: number, hour: number, minute: number) {
    return `${activityId}_${weekday}_${hour}_${minute}`;
}
