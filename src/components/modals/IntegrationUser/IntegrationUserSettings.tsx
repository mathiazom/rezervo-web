import { PasswordRounded } from "@mui/icons-material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";

import { useIntegrationUser } from "@/hooks/useIntegrationUser";
import { IntegrationIdentifier, IntegrationUserPayload } from "@/types/rezervo";

export default function IntegrationUserSettings({
    integration,
    submit,
    isSubmitting,
    onClose,
}: {
    integration: IntegrationIdentifier;
    submit: (payload: IntegrationUserPayload) => void;
    isSubmitting: boolean;
    onClose: () => void;
}) {
    const { integrationUser, integrationUserMissing } = useIntegrationUser(integration);

    const [username, setUsername] = useState(integrationUser?.username ?? "");
    const [password, setPassword] = useState("");

    return (
        <>
            <DialogTitle>Konfigurer {integration}-bruker</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <PersonRoundedIcon />
                        <TextField
                            sx={{ width: "100%" }}
                            value={username}
                            label={"Brukernavn"}
                            defaultValue={integrationUser?.username ?? ""}
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
                            {...(!integrationUserMissing
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
                    Lagre
                </LoadingButton>
            </DialogActions>
        </>
    );
}
