import { zeroIndexedWeekday } from "@/lib/helpers/date";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { ClassConfig, RezervoClass } from "@/types/openapi";

function buildConfigMapFromClasses(classes: RezervoClass[]) {
    return Object.fromEntries(
        classes.map((c) => {
            const { hour, minute, weekday } = c.startTime;
            return [
                classRecurrentId(c),
                {
                    activityId: c.activity.id.toString(),
                    weekday: zeroIndexedWeekday(weekday),
                    locationId: c.location.id,
                    startTime: { hour, minute },
                    displayName: c.activity.name,
                },
            ];
        }),
    );
}

// Build a config map for all classes, including "ghost" configs from the user config (recurring
// bookings whose class is not present in the current schedule), keyed by recurrent id.
export function buildAllClassesConfigMap(classes: RezervoClass[], recurringBookings: ClassConfig[] | undefined) {
    const classesConfigMap = buildConfigMapFromClasses(classes);
    const ghostClassesConfigs = Object.fromEntries(
        recurringBookings
            ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
            .map((c) => [classConfigRecurrentId(c), c]) ?? [],
    );
    return { ...classesConfigMap, ...ghostClassesConfigs };
}
