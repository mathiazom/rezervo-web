import { SitClass, SitSchedule } from "../types/sitTypes";
import { ClassPopularityIndex, ClassPopularity } from "../types/derivedTypes";
import { sitClassRecurrentId } from "./iBooking";

export function determineClassPopularity(sitClass: SitClass) {
    if (!sitClass || sitClass.available === undefined) return ClassPopularity.Unknown;
    if (sitClass.available <= 0) return ClassPopularity.High;
    if (sitClass.available / sitClass.capacity <= 0.2) return ClassPopularity.Medium;
    return ClassPopularity.Low;
}

export async function createClassPopularityIndex(previousWeekSchedule: SitSchedule): Promise<ClassPopularityIndex> {
    return previousWeekSchedule.days.reduce((popularityIndex, nextDay) => {
        for (const _class of nextDay.classes) {
            popularityIndex[sitClassRecurrentId(_class)] = determineClassPopularity(_class);
        }
        return popularityIndex;
    }, {} as ClassPopularityIndex);
}
