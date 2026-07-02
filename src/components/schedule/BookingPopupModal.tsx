import { Add, Clear, HourglassTop } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

import { $api } from "@/lib/api/client";
import { hasWaitingList } from "@/lib/helpers/attendance";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { RezervoClass } from "@/types/openapi";
import { BookingPopupAction } from "@/types/local";
import { useChain } from "@/lib/hooks/useChain";

const BookingPopupModal = ({
    onClose,
    _class,
    action,
}: {
    onClose: () => void;
    _class: RezervoClass;
    action: BookingPopupAction;
}) => {
    const chain = useChain();
    const { mutateSessionsIndex } = useUserSessionsIndex();
    const { mutateUserSessions } = useUserSessions();

    const onBookingSuccess = async () => {
        await mutateSessionsIndex();
        await mutateUserSessions();
        onClose();
    };
    const bookMutation = $api.useMutation("post", "/{chain_identifier}/book", { onSuccess: onBookingSuccess });
    const cancelBookingMutation = $api.useMutation("post", "/{chain_identifier}/cancel-booking", {
        onSuccess: onBookingSuccess,
    });
    const bookingLoading = bookMutation.isPending || cancelBookingMutation.isPending;

    const isCancellation = action === BookingPopupAction.CANCEL;
    const classDescription = `${_class.activity.name} (${_class.startTime.weekdayLong}, ${_class.startTime.toFormat(
        "HH:mm",
    )})`;

    function book() {
        bookMutation.mutate({
            params: { path: { chain_identifier: chain.profile.identifier } },
            body: { classId: _class.id },
        });
    }

    function cancelBooking() {
        cancelBookingMutation.mutate({
            params: { path: { chain_identifier: chain.profile.identifier } },
            body: { classId: _class.id },
        });
    }

    return (
        <Dialog open={action !== null} maxWidth={"xs"} fullWidth={true}>
            {_class !== null && action !== null && (
                <>
                    <DialogTitle>{isCancellation ? "Avbestille timen?" : "Booke førstkommende time?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <Typography>
                                {isCancellation ? (
                                    <>
                                        Du har allerede booket <b>{classDescription}</b>. Vil du avbestille denne nå?
                                    </>
                                ) : (
                                    <>
                                        Booking for <b>{classDescription}</b> har allerede åpnet. Vil du{" "}
                                        {hasWaitingList(_class) ? "sette deg på venteliste" : "booke timen nå"}?
                                    </>
                                )}
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={bookingLoading} onClick={onClose} color={"inherit"}>
                            Nei takk
                        </Button>
                        <Button
                            startIcon={isCancellation ? <Clear /> : hasWaitingList(_class) ? <HourglassTop /> : <Add />}
                            color={isCancellation ? "error" : hasWaitingList(_class) ? "warning" : "primary"}
                            variant={"outlined"}
                            onClick={isCancellation ? cancelBooking : book}
                            loading={bookingLoading}
                        >
                            {isCancellation ? "Avbestill" : hasWaitingList(_class) ? "Sett på venteliste" : "Book nå"}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default BookingPopupModal;
