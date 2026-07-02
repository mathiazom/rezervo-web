import { Modal } from "@mui/material";

import Agenda from "@/components/modals/Agenda/Agenda";
import { BaseUserSession, ChainConfig } from "@/types/openapi";

const AgendaModal = ({
    userSessions,
    chainConfigs,
    open,
    onClose,
}: {
    userSessions: BaseUserSession[];
    chainConfigs: Record<string, ChainConfig>;
    open: boolean;
    onClose: () => void;
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Agenda userSessions={userSessions} chainConfigs={chainConfigs} />
        </Modal>
    );
};

export default AgendaModal;
