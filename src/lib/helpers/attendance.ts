import { isClassInThePast } from "@/lib/helpers/date";
import { RezervoClass } from "@/types/chain";

export function shouldShowClassAttendance(_class: RezervoClass): boolean {
    return _class.isBookable || _class.isCancelled || isClassInThePast(_class);
}

export function stringifyClassAttendance(_class: RezervoClass): string | null {
    if (!shouldShowClassAttendance(_class)) return null;
    const isInThePast = isClassInThePast(_class);

    const waitListText =
        _class.waitingListCount != null && _class.waitingListCount > 0
            ? `${_class.waitingListCount} ${isInThePast ? "fikk ikke plass" : "er på venteliste"}`
            : null;

    if (_class.availableSlots == null || _class.totalSlots == null) {
        return waitListText ?? (isInThePast ? "Timen hadde ledige plasser" : "Timen har ledige plasser");
    }

    const numberOfAttendees = _class.totalSlots - Math.max(_class.availableSlots, 0);
    const attendanceSummary = `${numberOfAttendees} av ${_class.totalSlots} ${isInThePast ? "deltok" : "er påmeldt"}`;

    return waitListText ? `${attendanceSummary} | ${waitListText}` : attendanceSummary;
}

export function hasWaitingList(_class: RezervoClass): boolean {
    return !_class.availableSlots ? (_class.waitingListCount ?? 0) > 0 : _class.availableSlots <= 0;
}
