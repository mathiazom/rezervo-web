import { Avatar, Badge, Box, Button, CircularProgress, Tooltip, Typography } from "@mui/material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { hexColorHash } from "../../utils/colorUtils";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginIcon from "@mui/icons-material/Login";
import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import MobileConfigUpdateBar from "./MobileConfigUpdateBar";

function ConfigBar({
    isLoadingConfig,
    isConfigError,
    changed,
    agendaEnabled,
    onUpdateConfig,
    onUndoSelectionChanges,
    onSettingsOpen,
    onAgendaOpen,
}: {
    isLoadingConfig: boolean;
    isConfigError: boolean;
    changed: boolean;
    agendaEnabled: boolean;
    onUpdateConfig: () => void;
    onUndoSelectionChanges: () => void;
    onSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    const { user, isLoading } = useUser();
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
                    {isConfigError ? (
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
                    ) : isLoadingConfig ? (
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
                    ) : (
                        <>
                            {changed ? (
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
                                        <Typography color={"#fff"}>Oppdater</Typography>
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
                                <Tooltip title={"Agenda"}>
                                    <IconButton onClick={() => onAgendaOpen()} disabled={!agendaEnabled}>
                                        <FormatListBulletedRoundedIcon />
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
                        <Tooltip title={user.name}>
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
                visible={changed}
                isLoadingConfig={isLoadingConfig}
                onUpdateConfig={onUpdateConfig}
                onUndoSelectionChanges={onUndoSelectionChanges}
            />
        </>
    );
}

export default ConfigBar;
