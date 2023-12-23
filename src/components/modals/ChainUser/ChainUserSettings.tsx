import { PasswordRounded } from "@mui/icons-material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    DialogActions,
    DialogContent,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
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
    authenticationFailed,
}: {
    chainProfile: ChainProfile;
    submit: (payload: ChainUserPayload) => void;
    isSubmitting: boolean;
    onClose: () => void;
    authenticationFailed: boolean;
}) {
    const theme = useTheme();

    const { chainUser, chainUserMissing } = useChainUser(chainProfile.identifier);

    const [username, setUsername] = useState(chainUser?.username ?? "");
    const [password, setPassword] = useState("");

    const shortDevice = useMediaQuery("(max-height: 380px)");

    return (
        <>
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    marginTop: 1,
                }}
            >
                <Box sx={{ height: 50, flexShrink: 0, marginY: 2, display: shortDevice ? "none" : undefined }}>
                    <ChainLogo chainProfile={chainProfile} />
                </Box>
                <Typography variant={"h6"} textAlign={"center"}>
                    Koble til <b>{chainProfile.identifier.toUpperCase()}</b>-medlemskap
                </Typography>
                <Typography
                    variant={"subtitle2"}
                    sx={{ color: theme.palette.grey[600], textAlign: "center", maxWidth: "18rem", margin: "0 auto" }}
                >
                    Logg inn med brukeren din fra <b>{chainProfile.name}</b> for å koble den til <b>rezervo</b>
                </Typography>
                {authenticationFailed && (
                    <Alert severity={"error"} sx={{ my: 1 }}>
                        <AlertTitle>Feil brukernavn eller passord</AlertTitle>
                        <Typography>
                            Klarte ikke koble til {chainProfile.name}-brukeren din. Kontroller at du har skrevet inn
                            riktig brukernavn og passord.
                        </Typography>
                    </Alert>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: authenticationFailed ? 0 : "2rem" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
