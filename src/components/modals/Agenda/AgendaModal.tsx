import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Agenda from "@/components/modals/Agenda/Agenda";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig } from "@/types/config";
import { UserAgendaClass } from "@/types/userSessions";

const AgendaModal = ({
    agenda,
    chainConfigs,
    chainProfiles,
    open,
    setOpen,
}: {
    agenda: UserAgendaClass[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    chainProfiles: ChainProfile[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Agenda agenda={agenda} chainConfigs={chainConfigs} chainProfiles={chainProfiles} />
        </Modal>
    );
};

export default AgendaModal;
