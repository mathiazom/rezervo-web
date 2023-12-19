import { zeroIndexedWeekday } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { ClassConfig } from "@/types/config";

export function buildConfigMapFromClasses(classes: RezervoClass[]) {
    return classes.reduce<{ [id: string]: ClassConfig }>((o, c) => {
        const { hour, minute, weekday } = c.startTime;
        return {
            ...o,
            [classRecurrentId(c)]: {
                activity: c.activity.id,
                display_name: c.activity.name,
                weekday: zeroIndexedWeekday(weekday),
                studio: c.location.id,
                time: { hour, minute },
            },
        };
    }, {});
}
