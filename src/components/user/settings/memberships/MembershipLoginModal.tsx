import { PasswordRounded } from "@mui/icons-material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useState } from "react";

import ChainLogo from "@/components/chain/ChainLogo";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { ChainProfile, ChainUserPayload } from "@/types/openapi";

enum AuthenticationStatus {
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

    const {
        chainUser,
        putChainUser,
        destroyChainUser,
        putChainUserIsMutating: isMutating,
    } = useChainUser(chainProfile.identifier);

    const [authenticationStatus, setAuthenticationStatus] = useState<AuthenticationStatus>(
        AuthenticationStatus.INITIAL,
    );

    const [usernameInput, setUsernameInput] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

    const username = usernameInput ?? chainUser?.username ?? "";

    const isUsernamePasswordValid =
        username != null && username.trim() !== "" && password != null && password.trim() !== "";

    async function submitUsernamePassword(payload: ChainUserPayload) {
        setAuthenticationStatus(AuthenticationStatus.INITIAL);
        putChainUser(payload)
            .then(() => onClose())
            .catch(() => setAuthenticationStatus(AuthenticationStatus.FAILED));
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
            onClose={() => onClose()}
            maxWidth={"xs"}
            fullWidth={true}
            slotProps={{
                transition: {
                    onExited: () => {
                        setPassword("");
                        setAuthenticationStatus(AuthenticationStatus.INITIAL);
                    },
                },

                paper: {
                    sx: {
                        backgroundColor: "white",
                        "@media (prefers-color-scheme: dark)": {
                            backgroundColor: "black",
                        },
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
                <Box
                    sx={[
                        {
                            height: 50,
                            flexShrink: 0,
                            marginY: 2,
                        },
                        shortDevice
                            ? {
                                  display: "none",
                              }
                            : {
                                  display: null,
                              },
                    ]}
                >
                    <ChainLogo chainProfile={chainProfile} />
                </Box>
                <Typography
                    variant={"h6"}
                    sx={{
                        textAlign: "center",
                    }}
                >
                    {chainUser ? "Administrer" : "Koble til"} <b>{chainProfile.name}</b>-medlemskap
                </Typography>
                <Typography
                    variant={"subtitle2"}
                    sx={{ color: theme.palette.grey[600], textAlign: "center", maxWidth: "18rem", margin: "0 auto" }}
                >
                    {chainUser ? (
                        <>
                            Du har allerede koblet <b>{chainProfile.name}</b>-brukeren din til <b>rezervo</b>. Du kan
                            oppdatere kontoinformasjonen eller logge ut.
                        </>
                    ) : (
                        <>
                            Logg inn med brukeren din fra <b>{chainProfile.name}</b> for å koble den til <b>rezervo</b>
                        </>
                    )}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                    {authenticationStatus === AuthenticationStatus.FAILED && (
                        <Alert severity={"error"}>
                            <AlertTitle>Feil brukernavn eller passord</AlertTitle>
                            <Typography>
                                Klarte ikke koble til {chainProfile.name}-brukeren din. Sjekk at du har skrevet inn
                                riktig brukernavn og passord.
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
                                    void submitUsernamePassword({
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
                                    void submitUsernamePassword({
                                        username,
                                        password,
                                    });
                                }
                            }}
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Stack direction={"row"} sx={{ width: "100%" }}>
                    {chainUser && (
                        <Button
                            color={"error"}
                            onClick={async () => {
                                await destroyChainUser();
                                onClose();
                            }}
                        >
                            Logg ut
                        </Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button color={"inherit"} disabled={isMutating} onClick={() => onClose()}>
                        Lukk
                    </Button>
                    <Button
                        loading={isMutating}
                        disabled={!isUsernamePasswordValid}
                        onClick={() => {
                            if (isUsernamePasswordValid) {
                                void submitUsernamePassword({
                                    username,
                                    password,
                                });
                            }
                        }}
                    >
                        {chainUser ? "Oppdater" : "Logg inn"}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default MembershipLoginModal;
