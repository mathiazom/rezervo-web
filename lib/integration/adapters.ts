import { SitWeekSchedule } from "../../types/integration/sit";
import { RezervoWeekSchedule } from "../../types/rezervo";

export function sitToRezervoWeekSchedule(sitWeekSchedule: SitWeekSchedule): RezervoWeekSchedule {
    return sitWeekSchedule.days;
}
