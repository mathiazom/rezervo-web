import { Modal } from "@mui/material";

import Agenda from "@/components/modals/Agenda/Agenda";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig } from "@/types/config";
import { BaseUserSession } from "@/types/userSessions";

const AgendaModal = ({
    userSessions,
    chainConfigs,
    chainProfiles,
    open,
    onClose,
}: {
    userSessions: BaseUserSession[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    chainProfiles: ChainProfile[];
    open: boolean;
    onClose: () => void;
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Agenda userSessions={userSessions} chainConfigs={chainConfigs} chainProfiles={chainProfiles} />
        </Modal>
    );
};

export default AgendaModal;
