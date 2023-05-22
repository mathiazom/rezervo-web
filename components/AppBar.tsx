import { Avatar, Box, Button, CircularProgress, Tooltip, Typography, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import UndoIcon from "@mui/icons-material/Undo";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginIcon from "@mui/icons-material/Login";
import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function AppBar({
    isLoadingConfig,
    changed,
    agendaEnabled,
    onUpdateConfig,
    onUndoSelectionChanges,
    onSettingsOpen,
    onAgendaOpen,
}: {
    isLoadingConfig: boolean;
    changed: boolean;
    agendaEnabled: boolean;
    onUpdateConfig: () => void;
    onUndoSelectionChanges: () => void;
    onSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    const theme = useTheme();

    const { user, isLoading } = useUser();

    return (
        <Box height={"8vh"} display="flex" alignItems={"center"}>
            <Typography
                component="div"
                py={2}
                pl={2}
                sx={{
                    fontSize: { xs: "1.2rem", sm: "1.8rem" },
                    display: { xs: "none", md: "block" },
                }}
            >
                <strong style={{ color: theme.palette.primary.main }}>sit-rezervo</strong>
            </Typography>
            <Box sx={{ marginLeft: "auto", marginRight: { xs: 1, md: 2 } }}>
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
                        {isLoadingConfig ? (
                            <CircularProgress
                                sx={{
                                    display: {
                                        xs: "none",
                                        sm: "flex",
                                    },
                                }}
                                size={26}
                                thickness={6}
                            />
                        ) : changed ? (
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
                        {user.name && (
                            <Tooltip title={user.name}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        fontSize: 18,
                                        backgroundColor: theme.palette.primary.main,
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
                    <Box sx={{ backgroundColor: "grey" }}>
                        <Tooltip title={"Logg inn"}>
                            <IconButton color={"primary"} href={"/api/auth/login"}>
                                <LoginIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
