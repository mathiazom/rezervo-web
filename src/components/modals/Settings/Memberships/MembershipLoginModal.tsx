import { Alert, AlertTitle, Box, Dialog } from "@mui/material";
import React, { useState } from "react";

import MembershipLogin from "@/components/modals/Settings/Memberships/MembershipLogin";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { ChainProfile } from "@/types/chain";
import { ChainUserPayload } from "@/types/config";

enum AuthenticationState {
    INITIAL = "initial",
    TOTP_FLOW = "totp_flow",
    FAILED = "failed",
    SUCCESS = "success",
}

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
    const [authenticationState, setAuthenticationState] = useState<AuthenticationState>(AuthenticationState.INITIAL);

    async function onSubmit(payload: ChainUserPayload) {
        setAuthenticationState(AuthenticationState.INITIAL);
        putChainUser(payload)
            .then((res) => {
                console.log("putChainUser", res);
                if (res.status === "initiated_totp_flow") {
                    setAuthenticationState(AuthenticationState.TOTP_FLOW);
                    return;
                }
                close();
            })
            .catch(() => setAuthenticationState(AuthenticationState.FAILED));
    }

    function onClose() {
        if (!putChainUserIsMutating) {
            close();
            setAuthenticationState(AuthenticationState.INITIAL);
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
                        backgroundColor: "black",
                    },
                },
            }}
        >
            <MembershipLogin
                chainProfile={chainProfile}
                submit={onSubmit}
                isSubmitting={putChainUserIsMutating}
                onClose={onClose}
                authenticationFailed={authenticationState === AuthenticationState.FAILED}
            />
            {authenticationState === AuthenticationState.TOTP_FLOW && (
                <Box>
                    <Alert severity={"info"} variant={"outlined"}>
                        <AlertTitle>Two-factor authentication</AlertTitle>
                        You need to enter a two-factor authentication code to complete the login.
                    </Alert>
                </Box>
            )}
        </Dialog>
    );
};

export default MembershipLoginModal;
