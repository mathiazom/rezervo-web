import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Settings from "@/components/modals/Settings/Settings";
import { useFeatures } from "@/lib/hooks/useFeatures";
import { IntegrationProfile } from "@/types/integration";

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
    const { features } = useFeatures();

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                <Settings
                    integrationProfile={integrationProfile}
                    bookingActive={bookingActive}
                    features={features}
                    setBookingActive={setBookingActive}
                    openIntegrationUserSettings={openIntegrationUserSettings}
                />
            </>
        </Modal>
    );
};

export default SettingsModal;
