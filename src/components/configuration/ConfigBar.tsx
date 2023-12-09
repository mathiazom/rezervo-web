import { useUser } from "@auth0/nextjs-auth0/client";
import { CalendarMonth, PauseCircleRounded, RocketLaunchRounded } from "@mui/icons-material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LoginIcon from "@mui/icons-material/Login";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import UndoIcon from "@mui/icons-material/Undo";
import { Avatar, Badge, Box, Button, CircularProgress, Tooltip, Typography, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { useMemo } from "react";

import MobileConfigUpdateBar from "@/components/configuration/MobileConfigUpdateBar";
import { ChainIdentifier } from "@/lib/activeChains";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { arraysAreEqual } from "@/lib/utils/arrayUtils";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { ChainConfig } from "@/types/config";

function ConfigBar({
    chain,
    selectedClassIds,
    originalSelectedClassIds,
    userConfig,
    isLoadingConfig,
    isConfigError,
    onUndoSelectionChanges,
    onSettingsOpen,
    onChainUserSettingsOpen,
    onAgendaOpen,
    onUpdateConfig,
}: {
    chain: ChainIdentifier;
    selectedClassIds: string[] | null;
    originalSelectedClassIds: string[] | null;
    userConfig: ChainConfig | undefined;
    isLoadingConfig: boolean;
    isConfigError: boolean;
    onUndoSelectionChanges: () => void;
    onSettingsOpen: () => void;
    onChainUserSettingsOpen: () => void;
    onAgendaOpen: () => void;
    onUpdateConfig: () => Promise<ChainConfig> | undefined;
}) {
    const theme = useTheme();

    const { user, isLoading } = useUser();
    const { chainUserMissing } = useChainUser(chain);
    const { userConfigMissing } = useUserConfig(chain);

    const selectionChanged = useMemo(
        () =>
            selectedClassIds != null &&
            originalSelectedClassIds != null &&
            !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
        [originalSelectedClassIds, selectedClassIds],
    );

    const agendaEnabled = userConfig?.classes != undefined && userConfig.classes.length > 0;

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
                        <>
                            {selectionChanged ? (
                                <Box
                                    sx={{
                                        display: {
                                            xs: "none",
                                            sm: "flex",
                                        },
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Tooltip title={"Angre"}>
                                        <IconButton onClick={() => onUndoSelectionChanges()}>
                                            <UndoIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant={"contained"}
                                        startIcon={<CloudUploadIcon sx={{ color: "#fff" }} />}
                                        onClick={() => onUpdateConfig()}
                                    >
                                        <Typography color={"#fff"}>Lagre timeplan</Typography>
                                    </Button>
                                </Box>
                            ) : (
                                <Tooltip title={"Lagret"}>
                                    <CloudDoneIcon color={"disabled"} />
                                </Tooltip>
                            )}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <Tooltip title={"Min timeplan"}>
                                    <IconButton onClick={() => onAgendaOpen()} disabled={!agendaEnabled}>
                                        <CalendarMonth />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={"Innstillinger"}>
                                    <IconButton onClick={() => onSettingsOpen()}>
                                        <SettingsRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </>
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
            <MobileConfigUpdateBar
                visible={selectionChanged}
                isLoadingConfig={isLoadingConfig}
                onUpdateConfig={onUpdateConfig}
                onUndoSelectionChanges={onUndoSelectionChanges}
            />
        </>
    );
}

export default ConfigBar;
