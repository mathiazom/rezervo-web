import { useUser } from "@auth0/nextjs-auth0/client";
import { CalendarMonth, PauseCircleRounded, RocketLaunchRounded } from "@mui/icons-material";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LoginIcon from "@mui/icons-material/Login";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Avatar, Badge, Box, CircularProgress, Tooltip, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React from "react";

import { ChainIdentifier } from "@/lib/activeChains";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { ChainConfig } from "@/types/config";

function ConfigBar({
    chain,
    userConfig,
    isLoadingConfig,
    isConfigError,
    onSettingsOpen,
    onChainUserSettingsOpen,
    onAgendaOpen,
}: {
    chain: ChainIdentifier;
    userConfig: ChainConfig | undefined;
    isLoadingConfig: boolean;
    isConfigError: boolean;
    onSettingsOpen: () => void;
    onChainUserSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    const theme = useTheme();

    const { user, isLoading } = useUser();
    const { chainUserMissing } = useChainUser(chain);
    const { userConfigMissing } = useUserConfig(chain);

    return (
        <>
            {isLoading ? (
                <CircularProgress size={26} thickness={6} />
            ) : user ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, md: 1.5 },
                    }}
                >
                    {chainUserMissing ? (
                        <Box>
                            <Tooltip title={`Konfigurer ${chain}-bruker`}>
                                <IconButton onClick={() => onChainUserSettingsOpen()}>
                                    <RocketLaunchRounded />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : isLoadingConfig || userConfigMissing ? (
                        <CircularProgress
                            sx={{
                                mr: 1,
                                display: {
                                    xs: "none",
                                    sm: "flex",
                                },
                            }}
                            size={26}
                            thickness={6}
                        />
                    ) : isConfigError ? (
                        <Box mr={1.5}>
                            <Tooltip title={"Feilet"}>
                                <Badge
                                    overlap={"circular"}
                                    badgeContent={<ErrorRoundedIcon fontSize={"small"} color={"error"} />}
                                >
                                    <CloudOffRoundedIcon color={"disabled"} />
                                </Badge>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <Tooltip title={"Min timeplan"}>
                                <IconButton onClick={() => onAgendaOpen()}>
                                    <CalendarMonth />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={"Innstillinger"}>
                                <IconButton onClick={() => onSettingsOpen()}>
                                    <SettingsRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    {user.name && (
                        <Tooltip title={`${user.name}${userConfig?.active ? "" : " (pauset)"}`}>
                            <Badge
                                invisible={userConfig?.active ?? true}
                                overlap={"circular"}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                badgeContent={
                                    <PauseCircleRounded
                                        fontSize={"small"}
                                        color={"disabled"}
                                        sx={{ backgroundColor: theme.palette.background.default, borderRadius: "50%" }}
                                    />
                                }
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        fontSize: 18,
                                        backgroundColor: hexColorHash(user.name),
                                    }}
                                >
                                    {user.name[0]}
                                </Avatar>
                            </Badge>
                        </Tooltip>
                    )}
                    <Tooltip title={"Logg ut"}>
                        <IconButton href={"/api/auth/logout"}>
                            <LogoutRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ) : (
                <Box>
                    <Tooltip title={"Logg inn"}>
                        <IconButton color={"primary"} href={"/api/auth/login"}>
                            <LoginIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </>
    );
}

export default ConfigBar;
