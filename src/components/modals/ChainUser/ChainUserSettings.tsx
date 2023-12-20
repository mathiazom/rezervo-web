import { PasswordRounded } from "@mui/icons-material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";

import ChainLogo from "@/components/utils/ChainLogo";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { ChainProfile } from "@/types/chain";
import { ChainUserPayload } from "@/types/config";

export default function ChainUserSettings({
    chainProfile,
    submit,
    isSubmitting,
    onClose,
}: {
    chainProfile: ChainProfile;
    submit: (payload: ChainUserPayload) => void;
    isSubmitting: boolean;
    onClose: () => void;
}) {
    const { chainUser, chainUserMissing } = useChainUser(chainProfile.identifier);

    const [username, setUsername] = useState(chainUser?.username ?? "");
    const [password, setPassword] = useState("");

    return (
        <>
            <DialogTitle>
                <Box sx={{ height: 50 }}>
                    <ChainLogo chainProfile={chainProfile} />
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant={"h6"} textAlign={"center"} sx={{ mb: 1 }}>
                    Koble til <b>{chainProfile.identifier}</b>-medlemskap
                </Typography>
                <Typography variant={"subtitle2"} sx={{ opacity: 0.6, textAlign: "center" }}>
                    Logg inn med <b>{chainProfile.name}</b>-brukeren din for å koble den til <b>rezervo</b>
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <PersonRoundedIcon />
                        <TextField
                            sx={{ width: "100%" }}
                            value={username}
                            label={"Brukernavn"}
                            defaultValue={chainUser?.username ?? ""}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setUsername(event.target.value);
                            }}
                        />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <PasswordRounded />
                        <TextField
                            sx={{ width: "100%" }}
                            label={"Passord"}
                            value={password}
                            type={"password"}
                            {...(!chainUserMissing
                                ? {
                                      placeholder: "••••••••••••••••••••••••",
                                      InputLabelProps: { shrink: true },
                                  }
                                : {})}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(event.target.value);
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color={"inherit"} disabled={isSubmitting} onClick={() => onClose()}>
                    Lukk
                </Button>
                <LoadingButton
                    loading={isSubmitting}
                    disabled={password.trim() == "" || username.trim() == ""}
                    onClick={() =>
                        submit({
                            username,
                            password,
                        })
                    }
                >
                    Logg inn
                </LoadingButton>
            </DialogActions>
        </>
    );
}
