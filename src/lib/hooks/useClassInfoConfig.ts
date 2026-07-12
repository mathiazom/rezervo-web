import { useState } from "react";

import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { classToConfig } from "@/lib/utils/configUtils";
import { BookingPopupAction, BookingPopupState } from "@/types/local";
import { RezervoClass, SessionStatus } from "@/types/openapi";

// Booking/recurring-config actions for the class info modal, built directly from the deep-linked
// class and its own chain identifier rather than the schedule's classes/config map or the
// currently viewed chain — so it works regardless of which chain/week (if any) is loaded behind
// the modal.
export function useClassInfoConfig(chainIdentifier: string) {
    const { userConfig, putUserConfig } = useUserConfig(chainIdentifier);
    const { userSessionsIndex } = useUserSessionsIndex(chainIdentifier);
    const [bookingPopupState, setBookingPopupState] = useState<BookingPopupState | null>(null);

    const onUpdateConfig = async (_class: RezervoClass, selected: boolean) => {
        if (_class.isBookable) {
            const isBooked =
                userSessionsIndex?.[_class.id]?.some(
                    (userSession) => userSession.isSelf && userSession.status === SessionStatus.BOOKED,
                ) ?? false;
            if (selected && !isBooked) {
                setBookingPopupState({ chain: chainIdentifier, _class, action: BookingPopupAction.BOOK });
            } else if (!selected && isBooked) {
                setBookingPopupState({ chain: chainIdentifier, _class, action: BookingPopupAction.CANCEL });
            }
        }
        if (userConfig == null) return;
        const recurrentId = classRecurrentId(_class);
        const recurringBookings = userConfig.recurringBookings.filter(
            (cc) => classConfigRecurrentId(cc) !== recurrentId,
        );
        if (selected) {
            recurringBookings.push(classToConfig(_class));
        }
        return await putUserConfig({
            active: userConfig.active,
            recurringBookings,
        });
    };

    return { onUpdateConfig, bookingPopupState, setBookingPopupState };
}
