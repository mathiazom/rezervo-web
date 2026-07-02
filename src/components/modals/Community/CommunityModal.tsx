import { Modal } from "@mui/material";

import Community from "@/components/modals/Community/Community";

const CommunityModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Community />
        </Modal>
    );
};

export default CommunityModal;
