import { Dialog } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ChainUserSettings from "@/components/modals/ChainUser/ChainUserSettings";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { ChainProfile } from "@/types/chain";
import { ChainUserPayload } from "@/types/config";

const ChainUserSettingsModal = ({
    open,
    setOpen,
    chainProfile,
    onSubmit,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    chainProfile: ChainProfile;
    onSubmit: () => void;
}) => {
    const { putChainUser, putChainUserIsMutating } = useChainUser(chainProfile.identifier);

    function submit(payload: ChainUserPayload) {
        putChainUser(payload).then(() => {
            onSubmit();
        });
    }

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (!putChainUserIsMutating) {
                    setOpen(false);
                }
            }}
            maxWidth={"xs"}
            fullWidth={true}
        >
            <ChainUserSettings
                chainProfile={chainProfile}
                submit={submit}
                isSubmitting={putChainUserIsMutating}
                onClose={() => setOpen(false)}
            />
        </Dialog>
    );
};

export default ChainUserSettingsModal;
