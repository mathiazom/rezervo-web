import { zeroIndexedWeekday } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { ClassConfig } from "@/types/config";

export function buildConfigMapFromClasses(classes: RezervoClass[]) {
    return classes.reduce<Record<string, ClassConfig>>((o, c) => {
        const { hour, minute, weekday } = c.startTime;
        return {
            ...o,
            [classRecurrentId(c)]: {
                activityId: c.activity.id.toString(),
                weekday: zeroIndexedWeekday(weekday),
                locationId: c.location.id,
                startTime: { hour, minute },
                displayName: c.activity.name,
            } as ClassConfig,
        };
    }, {});
}
