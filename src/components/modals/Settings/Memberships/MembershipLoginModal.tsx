import { PasswordRounded, SmsRounded } from "@mui/icons-material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Dialog,
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

export enum AuthenticationState {
    USERNAME_PASSWORD = "USERNAME_PASSWORD",
    TOTP = "TOTP",
}

export enum AuthenticationStatus {
    INITIAL = "INITIAL",
    FAILED = "FAILED",
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
    const theme = useTheme();

    const { chainUser, putChainUser, putChainUserTotp, putChainUserIsMutating, putChainUserTotpIsMutating } =
        useChainUser(chainProfile.identifier);

    const [authenticationState, setAuthenticationState] = useState<AuthenticationState>(
        AuthenticationState.USERNAME_PASSWORD,
    );
    const [authenticationStatus, setAuthenticationStatus] = useState<AuthenticationStatus>(
        AuthenticationStatus.INITIAL,
    );
    const [totpRegex, setTotpRegex] = useState<RegExp | null>(null);

    const [usernameInput, setUsernameInput] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [totp, setTotp] = useState("");
    const [isTotpValid, setIsTotpValid] = useState(false);

    const username = usernameInput ?? chainUser?.username ?? "";

    const isUsernamePasswordValid =
        username != null && username.trim() !== "" && password != null && password.trim() !== "";

    const isMutating =
        authenticationState === AuthenticationState.TOTP ? putChainUserTotpIsMutating : putChainUserIsMutating;

    async function submitUsernamePassword(payload: ChainUserPayload) {
        setAuthenticationStatus(AuthenticationStatus.INITIAL);
        putChainUser(payload)
            .then((res) => {
                if (res.status === "initiated_totp_flow") {
                    setAuthenticationState(AuthenticationState.TOTP);
                    setTotpRegex(new RegExp(res.totpRegex));
                    return;
                }
                onClose();
            })
            .catch(() => setAuthenticationStatus(AuthenticationStatus.FAILED));
    }

    async function submitTotp(totp: string) {
        setAuthenticationStatus(AuthenticationStatus.INITIAL);
        putChainUserTotp({ totp })
            .then(() => onClose())
            .catch(() => setAuthenticationStatus(AuthenticationStatus.FAILED));
    }

    function onTotpChange(totp: string) {
        setTotp(totp);
        if (totpRegex == null) {
            return;
        }
        const valid = totpRegex.test(totp);
        setIsTotpValid(valid);
        if (!valid) {
            return;
        }
        return submitTotp(totp);
    }

    function onClose() {
        if (!isMutating) {
            close();
        }
    }

    const shortDevice = useMediaQuery("(max-height: 380px)");

    return (
        <Dialog
            open={open}
            onClose={() => authenticationState !== AuthenticationState.TOTP && onClose()}
            TransitionProps={{
                onExited: () => {
                    setTotp("");
                    setIsTotpValid(false);
                    setPassword("");
                    setAuthenticationStatus(AuthenticationStatus.INITIAL);
                    setAuthenticationState(AuthenticationState.USERNAME_PASSWORD);
                },
            }}
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
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    {authenticationState === AuthenticationState.TOTP ? (
                        authenticationStatus === AuthenticationStatus.FAILED ? (
                            <Alert severity={"error"}>
                                <AlertTitle>Bekreftelse feilet</AlertTitle>
                                <Typography>
                                    En feil oppstod under bekreftelse med engangskode. Vennligst prøv igjen senere.
                                </Typography>
                            </Alert>
                        ) : (
                            <>
                                <Alert severity={"info"} icon={<SmsRounded />}>
                                    <AlertTitle>Engangskode på SMS</AlertTitle>
                                    <Typography>Skriv inn koden under for å fullføre innloggingen</Typography>
                                </Alert>

                                <TextField
                                    sx={{ width: "100%" }}
                                    value={totp}
                                    disabled={isTotpValid}
                                    label={"Engangskode"}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        onTotpChange(event.target.value);
                                    }}
                                    onKeyDown={(event: React.KeyboardEvent) => {
                                        if (event.key === "Enter" && isTotpValid) {
                                            submitTotp(totp);
                                        }
                                    }}
                                    slotProps={{
                                        htmlInput: {
                                            autoComplete: "one-time-code",
                                        },
                                    }}
                                />
                            </>
                        )
                    ) : (
                        <>
                            {authenticationStatus === AuthenticationStatus.FAILED && (
                                <Alert severity={"error"}>
                                    <AlertTitle>Feil brukernavn eller passord</AlertTitle>
                                    <Typography>
                                        Klarte ikke koble til {chainProfile.name}-brukeren din. Sjekk at du har skrevet
                                        inn riktig brukernavn og passord.
                                    </Typography>
                                </Alert>
                            )}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                                <PersonRoundedIcon />
                                <TextField
                                    sx={{ width: "100%" }}
                                    value={username}
                                    label={"Brukernavn"}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setUsernameInput(event.target.value);
                                    }}
                                    onKeyDown={(event: React.KeyboardEvent) => {
                                        if (event.key === "Enter" && isUsernamePasswordValid) {
                                            submitUsernamePassword({
                                                username,
                                                password,
                                            });
                                        }
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
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        setPassword(event.target.value);
                                    }}
                                    onKeyDown={(event: React.KeyboardEvent) => {
                                        if (event.key === "Enter" && isUsernamePasswordValid) {
                                            submitUsernamePassword({
                                                username,
                                                password,
                                            });
                                        }
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color={"inherit"} disabled={isMutating} onClick={() => onClose()}>
                    {authenticationState === AuthenticationState.TOTP ? "Avbryt" : "Lukk"}
                </Button>
                {!(
                    authenticationState === AuthenticationState.TOTP &&
                    authenticationStatus === AuthenticationStatus.FAILED
                ) && (
                    <LoadingButton
                        loading={isMutating}
                        disabled={
                            authenticationState === AuthenticationState.TOTP
                                ? totp.trim() == ""
                                : !isUsernamePasswordValid
                        }
                        onClick={() => {
                            if (authenticationState === AuthenticationState.TOTP) {
                                submitTotp(totp);
                            } else if (isUsernamePasswordValid) {
                                submitUsernamePassword({
                                    username,
                                    password,
                                });
                            }
                        }}
                    >
                        {authenticationState === AuthenticationState.TOTP ? "Bekreft" : "Logg inn"}
                    </LoadingButton>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default MembershipLoginModal;
