import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";
import { NotificationsConfig } from "../../types/rezervoTypes";
import Settings from "../Settings";

const SettingsModal = ({
    open,
    setOpen,
    bookingActive,
    bookingActiveLoading,
    onBookingActiveChanged,
    notificationsConfig,
    notificationsConfigLoading,
    onNotificationsConfigChanged,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    bookingActive: boolean;
    bookingActiveLoading: boolean;
    // eslint-disable-next-line no-unused-vars
    onBookingActiveChanged: (active: boolean) => void;
    notificationsConfig: NotificationsConfig | null;
    notificationsConfigLoading: boolean;
    // eslint-disable-next-line no-unused-vars
    onNotificationsConfigChanged: (notificationsConfig: NotificationsConfig) => void;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Settings
                bookingActive={bookingActive}
                bookingActiveLoading={bookingActiveLoading}
                onBookingActiveChanged={onBookingActiveChanged}
                notificationsConfig={notificationsConfig}
                notificationsConfigLoading={notificationsConfigLoading}
                onNotificationsConfigChanged={onNotificationsConfigChanged}
            />
        </Modal>
    );
};

export default SettingsModal;
