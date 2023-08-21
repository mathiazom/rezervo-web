import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import { NotificationsConfig } from "../../../types/rezervo";
import Settings from "./Settings";

const SettingsModal = ({
    open,
    setOpen,
    bookingActive,
    setBookingActive,
    notificationsConfig,
    setNotificationsConfig,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    bookingActive: boolean;
    setBookingActive: Dispatch<SetStateAction<boolean>>;
    notificationsConfig: NotificationsConfig | null;
    setNotificationsConfig: Dispatch<NotificationsConfig>;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Settings
                bookingActive={bookingActive}
                setBookingActive={setBookingActive}
                notificationsConfig={notificationsConfig}
                setNotificationsConfig={setNotificationsConfig}
            />
        </Modal>
    );
};

export default SettingsModal;
