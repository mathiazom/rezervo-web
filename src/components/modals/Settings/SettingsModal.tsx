import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Settings from "@/components/modals/Settings/Settings";
import { useFeatures } from "@/lib/hooks/useFeatures";
import { ChainProfile } from "@/types/chain";

const SettingsModal = ({
    open,
    setOpen,
    chainProfile,
    bookingActive,
    setBookingActive,
    openChainUserSettings,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    chainProfile: ChainProfile;
    bookingActive: boolean;
    setBookingActive: Dispatch<SetStateAction<boolean>>;
    openChainUserSettings: () => void;
}) => {
    const { features } = useFeatures();

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                <Settings
                    chainProfile={chainProfile}
                    bookingActive={bookingActive}
                    features={features}
                    setBookingActive={setBookingActive}
                    openChainUserSettings={openChainUserSettings}
                />
            </>
        </Modal>
    );
};

export default SettingsModal;
