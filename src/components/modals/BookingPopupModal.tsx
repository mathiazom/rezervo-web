import { Add, Clear, HourglassTop } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Dialog, DialogActions, DialogTitle, Typography } from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import React, { useState } from "react";

import { ChainIdentifier } from "@/lib/activeChains";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { RezervoClass } from "@/types/chain";

const BookingPopupModal = ({
    onClose,
    chain,
    _class,
    action,
}: {
    onClose: () => void;
    chain: ChainIdentifier;
    _class: RezervoClass | null;
    action: "book" | "cancel" | null;
}) => {
    const { mutateSessionsIndex } = useUserSessions(chain);
    const [bookingLoading, setBookingLoading] = useState(false);
    const isCancellation = action === "cancel";
    const classDescription = _class
        ? `${_class.activity.name} (${_class.startTime.weekdayLong}, ${_class.startTime.toFormat("HH:mm")})`
        : "";

    async function book() {
        setBookingLoading(true);
        await fetch(`/api/${chain}/book`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class?.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
        onClose();
    }

    async function cancelBooking() {
        setBookingLoading(true);
        await fetch(`/api/${chain}/cancel-booking`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class?.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
        onClose();
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
                                        {_class.availableSlots > 0 ? "booke timen nå" : "sette deg på venteliste"}?
                                    </>
                                )}
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={bookingLoading} onClick={onClose} color={"inherit"}>
                            Nei takk
                        </Button>
                        <LoadingButton
                            startIcon={
                                isCancellation ? <Clear /> : _class.availableSlots > 0 ? <Add /> : <HourglassTop />
                            }
                            color={isCancellation ? "error" : _class.availableSlots > 0 ? "primary" : "warning"}
                            variant={"outlined"}
                            onClick={isCancellation ? cancelBooking : book}
                            loading={bookingLoading}
                        >
                            {isCancellation
                                ? "Avbestill"
                                : _class.availableSlots > 0
                                  ? "Book nå"
                                  : "Sett på venteliste"}
                        </LoadingButton>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default BookingPopupModal;
