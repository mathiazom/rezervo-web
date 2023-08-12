import { SitClass } from "../types/integration/sit";
import { isClassInThePast, sitClassRecurrentId } from "./integration/sit";
import { ClassPopularity, ClassPopularityIndex, RezervoWeekSchedule } from "../types/rezervo";

export function determineClassPopularity(sitClass: SitClass) {
    if (!sitClass || sitClass.available === undefined) return ClassPopularity.Unknown;
    if (sitClass.available <= 0) return ClassPopularity.High;
    if (sitClass.available / sitClass.capacity <= 0.2) return ClassPopularity.Medium;
    return ClassPopularity.Low;
}

export function createClassPopularityIndex(previousWeekSchedule: RezervoWeekSchedule): ClassPopularityIndex {
    return previousWeekSchedule
        .flatMap((d) => d.classes)
        .reduce(
            (popularityIndex, _class) => ({
                ...popularityIndex,
                [sitClassRecurrentId(_class)]: determineClassPopularity(_class),
            }),
            {} as ClassPopularityIndex
        );
}

export function stringifyClassPopularity(_class: SitClass, historicPopularity: ClassPopularity): string {
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
