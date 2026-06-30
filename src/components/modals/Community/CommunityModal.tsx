import { Modal } from "@mui/material";

import Community from "@/components/modals/Community/Community";
import { ChainProfile } from "@/types/chain";

const CommunityModal = ({
    open,
    onClose,
    chainProfiles,
}: {
    open: boolean;
    onClose: () => void;
    chainProfiles: ChainProfile[];
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Community chainProfiles={chainProfiles} />
        </Modal>
    );
};

export default CommunityModal;
