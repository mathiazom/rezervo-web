import { useUser } from "@auth0/nextjs-auth0/client";
import { CalendarMonth, CalendarToday, PauseCircleRounded, People } from "@mui/icons-material";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LoginIcon from "@mui/icons-material/Login";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Avatar, Badge, Box, Tooltip, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useMemo } from "react";

import { useCommunity } from "@/lib/hooks/useCommunity";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { ChainIdentifier } from "@/types/chain";
import { UserRelationship } from "@/types/community";
import { ChainConfig } from "@/types/config";
import { BaseUserSession } from "@/types/userSessions";

function ConfigBar({
    chainConfigs,
    userSessions,
    isLoadingConfig,
    isConfigError,
    onCommunityOpen,
    onSettingsOpen,
    onAgendaOpen,
}: {
    chainConfigs: Record<ChainIdentifier, ChainConfig> | null;
    userSessions: BaseUserSession[] | null;
    isLoadingConfig: boolean;
    isConfigError: boolean;
    onCommunityOpen: () => void;
    onSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    const theme = useTheme();
    const { user, isLoading } = useUser();
    const { community } = useCommunity();
    const friendRequestCount =
        community?.users.filter((cu) => cu.relationship === UserRelationship.REQUEST_RECEIVED).length ?? 0;

    const bookingPaused = useMemo(() => {
        if (chainConfigs == null) return false;
        const configsArray = Object.values(chainConfigs);
        return configsArray.length > 0 && configsArray.every((config) => !config.active);
    }, [chainConfigs]);

    useEffect(() => {
        fetch("/api/user", {
            method: "PUT",
        });
    }, []);

    return (
        !isLoading && (
            <>
                {user == undefined ? (
                    <Button endIcon={<LoginIcon />} href={"/api/auth/login"}>
                        Logg inn
                    </Button>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, md: 1.5 },
                        }}
                    >
                        {isConfigError ? (
                            !isLoadingConfig && (
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
                            )
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Tooltip
                                        title={
                                            friendRequestCount > 0
                                                ? `Du har ${friendRequestCount} ubesvarte venneforespørsler`
                                                : "Venner"
                                        }
                                    >
                                        <IconButton onClick={() => onCommunityOpen()}>
                                            {friendRequestCount > 0 ? (
                                                <Badge
                                                    badgeContent={friendRequestCount}
                                                    color={"error"}
                                                    sx={{
                                                        "& .MuiBadge-badge": {
                                                            fontSize: 10,
                                                            height: 18,
                                                            minWidth: 18,
                                                        },
                                                    }}
                                                >
                                                    <People />
                                                </Badge>
                                            ) : (
                                                <People />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={`Min timeplan${bookingPaused ? " (pauset)" : ""}`}>
                                        <Badge
                                            onClick={() => onAgendaOpen()}
                                            invisible={!bookingPaused}
                                            overlap={"circular"}
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            badgeContent={
                                                <PauseCircleRounded
                                                    fontSize={"small"}
                                                    color={"disabled"}
                                                    sx={{
                                                        cursor: "pointer",
                                                        backgroundColor: theme.palette.background.default,
                                                        borderRadius: "50%",
                                                        marginTop: "-0.5rem",
                                                        marginLeft: "-0.5rem",
                                                    }}
                                                />
                                            }
                                        >
                                            <IconButton onClick={() => onAgendaOpen()}>
                                                {(userSessions?.length ?? 0) > 0 ? (
                                                    <CalendarMonth />
                                                ) : (
                                                    <CalendarToday />
                                                )}
                                            </IconButton>
                                        </Badge>
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
                )}
            </>
        )
    );
}

export default ConfigBar;
