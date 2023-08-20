import { SitDaySchedule, SitWeekSchedule } from "../../types/integration/sit";
import { RezervoWeekSchedule } from "../../types/rezervo";

export function sitToRezervoWeekSchedule(sitWeekSchedule: SitWeekSchedule): RezervoWeekSchedule {
    return sitWeekSchedule.days.map((sitDaySchedule: SitDaySchedule) => ({
        date: sitDaySchedule.date,
        classes: sitDaySchedule.classes,
    }));
}
