import { zeroIndexedWeekday } from "@/lib/helpers/date";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { ClassConfig } from "@/types/config";

function buildConfigMapFromClasses(classes: RezervoClass[]) {
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

// Build a config map for all classes, including "ghost" configs from the user config (recurring
// bookings whose class is not present in the current schedule), keyed by recurrent id.
export function buildAllClassesConfigMap(
    classes: RezervoClass[],
    recurringBookings: ClassConfig[] | undefined,
): Record<string, ClassConfig> {
    const classesConfigMap = buildConfigMapFromClasses(classes);
    const ghostClassesConfigs =
        recurringBookings
            ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
            .reduce<Record<string, ClassConfig>>(
                (o, c) => ({
                    ...o,
                    [classConfigRecurrentId(c)]: c,
                }),
                {},
            ) ?? {};
    return { ...classesConfigMap, ...ghostClassesConfigs };
}
