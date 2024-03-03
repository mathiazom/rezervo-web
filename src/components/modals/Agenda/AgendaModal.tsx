import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Agenda from "@/components/modals/Agenda/Agenda";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig } from "@/types/config";
import { BaseUserSession } from "@/types/userSessions";

const AgendaModal = ({
    userSession,
    chainConfigs,
    chainProfiles,
    open,
    setOpen,
}: {
    userSession: BaseUserSession[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    chainProfiles: ChainProfile[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Agenda userSessions={userSession} chainConfigs={chainConfigs} chainProfiles={chainProfiles} />
        </Modal>
    );
};

export default AgendaModal;
