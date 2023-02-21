import {SitClass} from "../types/sitTypes";
import {ClassDemandLevel} from "../types/derivedTypes";

export function determineClassDemandLevel(sitClass: SitClass) {
    if (!sitClass || sitClass.available === undefined) return ClassDemandLevel.Unknown
    if (sitClass.available <= 0) return ClassDemandLevel.High
    if (sitClass.available <= 5) return ClassDemandLevel.Medium
    return ClassDemandLevel.Low
}
