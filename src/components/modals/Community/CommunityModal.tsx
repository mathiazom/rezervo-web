import { Modal } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import Community from "@/components/modals/Community/Community";
import { ChainProfile } from "@/types/chain";

const CommunityModal = ({
    open,
    setOpen,
    chainProfiles,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    chainProfiles: ChainProfile[];
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Community chainProfiles={chainProfiles} />
        </Modal>
    );
};

export default CommunityModal;
