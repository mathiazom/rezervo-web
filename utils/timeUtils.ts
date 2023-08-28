import { getDateTime } from "../lib/integration/common";

export function simpleTimeStringFromISO(isoString: string) {
    return getDateTime(isoString).toFormat("hh:mm");
}
