import { Dialog } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ChainUserSettings from "@/components/modals/ChainUser/ChainUserSettings";
import { ChainIdentifier } from "@/lib/activeChains";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { ChainUserPayload } from "@/types/config";

const ChainUserSettingsModal = ({
    open,
    setOpen,
    chain,
    onSubmit,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    chain: ChainIdentifier;
    onSubmit: () => void;
}) => {
    const { putChainUser, putChainUserIsMutating } = useChainUser(chain);

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
                chain={chain}
                submit={submit}
                isSubmitting={putChainUserIsMutating}
                onClose={() => setOpen(false)}
            />
        </Dialog>
    );
};

export default ChainUserSettingsModal;
