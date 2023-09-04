import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Settings from "@/components/modals/Settings/Settings";
import { IntegrationProfile } from "@/types/rezervo";

const SettingsModal = ({
    open,
    setOpen,
    integrationProfile,
    bookingActive,
    setBookingActive,
    openIntegrationUserSettings,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    integrationProfile: IntegrationProfile;
    bookingActive: boolean;
    setBookingActive: Dispatch<SetStateAction<boolean>>;
    openIntegrationUserSettings: () => void;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Settings
                integrationProfile={integrationProfile}
                bookingActive={bookingActive}
                setBookingActive={setBookingActive}
                openIntegrationUserSettings={openIntegrationUserSettings}
            />
        </Modal>
    );
};

export default SettingsModal;
