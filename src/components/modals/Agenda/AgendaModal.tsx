import { Modal } from "@mui/material";

import Agenda from "@/components/modals/Agenda/Agenda";
import { BaseUserSession, ChainConfig, ChainProfile } from "@/types/openapi";

const AgendaModal = ({
    userSessions,
    chainConfigs,
    chainProfiles,
    open,
    onClose,
}: {
    userSessions: BaseUserSession[];
    chainConfigs: Record<string, ChainConfig>;
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
