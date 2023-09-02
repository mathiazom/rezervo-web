import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Settings from "components/modals/Settings/Settings";
import { IntegrationIdentifier } from "types/rezervo";

const SettingsModal = ({
    open,
    setOpen,
    integration,
    bookingActive,
    setBookingActive,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    integration: IntegrationIdentifier;
    bookingActive: boolean;
    setBookingActive: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Settings integration={integration} bookingActive={bookingActive} setBookingActive={setBookingActive} />
        </Modal>
    );
};

export default SettingsModal;
