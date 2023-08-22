import { ClassPopularity, ClassPopularityIndex, RezervoClass, RezervoWeekSchedule } from "../types/rezervo";
import { classRecurrentId, isClassInThePast } from "./integration/common";

export function determineClassPopularity(_class: RezervoClass) {
    if (!_class || _class.available === undefined) return ClassPopularity.Unknown;
    if (_class.available <= 0) return ClassPopularity.High;
    if (_class.available / _class.capacity <= 0.2) return ClassPopularity.Medium;
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
    const numberOfAttendees = _class.capacity - Math.max(_class.available, 0);

    if (isInThePast) {
        classPopularityInfo = `${numberOfAttendees} av ${_class.capacity} deltok`;
    } else if (_class.bookable) {
        classPopularityInfo = `${numberOfAttendees} av ${_class.capacity} er påmeldt`;
    } else {
        classPopularityInfo = historicPopularity;
    }

    if (_class.waitlist.count > 0) {
        classPopularityInfo += ` | ${_class.waitlist.count} ${isInThePast ? "fikk ikke plass" : "er på venteliste"}`;
    }
    return classPopularityInfo;
}
