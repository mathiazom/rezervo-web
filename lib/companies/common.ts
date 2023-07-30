import { DateTime } from "luxon";
import { TIME_ZONE } from "../../config/config";

export const calculateMondayOffset = () => DateTime.now().setZone(TIME_ZONE).weekday - 1;
