import { isClassInThePast } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass, RezervoWeekSchedule } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

export function determineClassPopularity(_class: RezervoClass) {
    if (!_class || _class.availableSlots === undefined) return ClassPopularity.Unknown;
    if (_class.availableSlots <= 0) return ClassPopularity.High;
    if (_class.availableSlots / _class.totalSlots <= 0.2) return ClassPopularity.Medium;
    return ClassPopularity.Low;
}

// TODO: move popularity logic to backend
export function createClassPopularityIndex(previousWeekSchedule: RezervoWeekSchedule): ClassPopularityIndex {
    return previousWeekSchedule.days
        .flatMap((d) => d.classes)
        .reduce(
            (popularityIndex, _class) => ({
                ...popularityIndex,
                [classRecurrentId(_class)]: determineClassPopularity(_class),
            }),
            {} as ClassPopularityIndex,
        );
}

export function stringifyClassPopularity(_class: RezervoClass, historicPopularity: ClassPopularity): string {
    let classPopularityInfo: string;
    const isInThePast = isClassInThePast(_class);
    const numberOfAttendees = _class.totalSlots - Math.max(_class.availableSlots, 0);

    if (isInThePast) {
        classPopularityInfo = `${numberOfAttendees} av ${_class.totalSlots} deltok`;
    } else if (_class.isBookable) {
        classPopularityInfo = `${numberOfAttendees} av ${_class.totalSlots} er påmeldt`;
    } else {
        classPopularityInfo = historicPopularity;
    }

    if (_class.waitingListCount != null && _class.waitingListCount > 0) {
        classPopularityInfo += ` | ${_class.waitingListCount} ${isInThePast ? "fikk ikke plass" : "er på venteliste"}`;
    }
    return classPopularityInfo;
}
