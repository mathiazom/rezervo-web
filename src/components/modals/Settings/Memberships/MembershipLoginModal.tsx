import { Dialog } from "@mui/material";
import React, { useState } from "react";

import MembershipLogin from "@/components/modals/Settings/Memberships/MembershipLogin";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { ChainProfile } from "@/types/chain";
import { ChainUserPayload } from "@/types/config";

const MembershipLoginModal = ({
    open,
    close,
    chainProfile,
}: {
    open: boolean;
    close: () => void;
    chainProfile: ChainProfile;
}) => {
    const { putChainUser, putChainUserIsMutating } = useChainUser(chainProfile.identifier);
    const [authenticationFailed, setAuthenticationFailed] = useState(false);

    async function onSubmit(payload: ChainUserPayload) {
        setAuthenticationFailed(false);
        putChainUser(payload)
            .then(() => close())
            .catch(() => setAuthenticationFailed(true));
    }

    function onClose() {
        if (!putChainUserIsMutating) {
            close();
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
            <MembershipLogin
                chainProfile={chainProfile}
                submit={onSubmit}
                isSubmitting={putChainUserIsMutating}
                onClose={onClose}
                authenticationFailed={authenticationFailed}
            />
        </Dialog>
    );
};

export default MembershipLoginModal;
