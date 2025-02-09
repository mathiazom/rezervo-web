import { Modal } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import Agenda from "@/components/modals/Agenda/Agenda";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig } from "@/types/config";
import { BaseUserSession } from "@/types/userSessions";

const AgendaModal = ({
    userSessions,
    chainConfigs,
    chainProfiles,
    open,
    setOpen,
}: {
    userSessions: BaseUserSession[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    chainProfiles: ChainProfile[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Agenda userSessions={userSessions} chainConfigs={chainConfigs} chainProfiles={chainProfiles} />
        </Modal>
    );
};

export default AgendaModal;
