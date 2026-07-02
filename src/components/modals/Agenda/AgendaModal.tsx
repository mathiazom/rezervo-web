import { Modal } from "@mui/material";

import Agenda from "@/components/modals/Agenda/Agenda";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserSessions } from "@/lib/hooks/useUserSessions";

const AgendaModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { userSessions } = useUserSessions();
    const { userChainConfigs } = useUserChainConfigs();

    if (userSessions === null || userChainConfigs === null) {
        return null;
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Agenda userSessions={userSessions} chainConfigs={userChainConfigs} />
        </Modal>
    );
};

export default AgendaModal;
