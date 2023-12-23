import { Dialog } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";

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
    const [authenticationFailed, setAuthenticationFailed] = useState(false);

    async function submit(payload: ChainUserPayload) {
        setAuthenticationFailed(false);
        const chainUser = await putChainUser(payload);
        if (chainUser.username) {
            onSubmit();
        } else {
            setAuthenticationFailed(true);
        }
    }
    function onClose() {
        if (!putChainUserIsMutating) {
            setOpen(false);
            setAuthenticationFailed(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"xs"}
            fullWidth={true}
            PaperProps={{
                sx: {
                    backgroundColor: "white",
                    '[data-mui-color-scheme="dark"] &': {
                        backgroundColor: "#181818",
                    },
                },
            }}
        >
            <ChainUserSettings
                chainProfile={chainProfile}
                submit={submit}
                isSubmitting={putChainUserIsMutating}
                onClose={onClose}
                authenticationFailed={authenticationFailed}
            />
        </Dialog>
    );
};

export default ChainUserSettingsModal;
