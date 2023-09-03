import { classRecurrentId, isClassInThePast } from "@/lib/integration/common";
import { ClassPopularity, ClassPopularityIndex, RezervoClass, RezervoWeekSchedule } from "@/types/rezervo";

export function determineClassPopularity(_class: RezervoClass) {
    if (!_class || _class.availableSlots === undefined) return ClassPopularity.Unknown;
    if (_class.availableSlots <= 0) return ClassPopularity.High;
    if (_class.availableSlots / _class.totalSlots <= 0.2) return ClassPopularity.Medium;
    return ClassPopularity.Low;
}

export function createClassPopularityIndex(previousWeekSchedule: RezervoWeekSchedule): ClassPopularityIndex {
    return previousWeekSchedule
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

    if (_class.waitingList.count > 0) {
        classPopularityInfo += ` | ${_class.waitingList.count} ${isInThePast ? "fikk ikke plass" : "er på venteliste"}`;
    }
    return classPopularityInfo;
}
