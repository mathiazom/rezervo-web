import { useUser } from "@auth0/nextjs-auth0/client";
import { CalendarMonth, CalendarToday, PauseCircleRounded, People } from "@mui/icons-material";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LoginIcon from "@mui/icons-material/Login";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Badge, Box, Tooltip, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useMemo, useState } from "react";

import { UserAvatar } from "@/components/utils/UserAvatar";
import { buildAuthProxyPath, put } from "@/lib/helpers/requests";
import { useCommunity } from "@/lib/hooks/useCommunity";
import { useMyUserId } from "@/stores/userStore";
import { ChainIdentifier } from "@/types/chain";
import { UserRelationship } from "@/types/community";
import { ChainConfig } from "@/types/config";
import { BaseUserSession } from "@/types/userSessions";

function ConfigBar({
    chainConfigs,
    userSessions,
    isLoadingConfig,
    isConfigError,
    onRefetchConfig,
    onCommunityOpen,
    onSettingsOpen,
    onAgendaOpen,
    onProfileOpen,
}: {
    chainConfigs: Record<ChainIdentifier, ChainConfig> | null;
    userSessions: BaseUserSession[] | null;
    isLoadingConfig: boolean;
    isConfigError: boolean;
    onRefetchConfig: () => Promise<void>;
    onCommunityOpen: () => void;
    onSettingsOpen: () => void;
    onAgendaOpen: () => void;
    onProfileOpen: () => void;
}) {
    const theme = useTheme();
    const { user, isLoading: isLoadingUser } = useUser();
    const [isUserUpserted, setIsUserUpserted] = useState(false);
    const setMyUserId = useMyUserId((state) => state.setUserId);
    const { community } = useCommunity();
    const friendRequestCount =
        community?.users.filter((cu) => cu.relationship === UserRelationship.REQUEST_RECEIVED).length ?? 0;

    const bookingPaused = useMemo(() => {
        if (chainConfigs == null) return false;
        const configsArray = Object.values(chainConfigs);
        return configsArray.length > 0 && configsArray.every((config) => !config.active);
    }, [chainConfigs]);

    useEffect(() => {
        if (user == undefined) return;
        put("user", { mode: "authProxy" }).then(async (res) => {
            if (!res.ok) return;
            setMyUserId(await res.json());
            await onRefetchConfig();
            setIsUserUpserted(true);
        });
    }, [user, setMyUserId, onRefetchConfig]);

    return (
        !isLoadingUser && (
            <>
                {user == undefined ? (
                    <Button endIcon={<LoginIcon />} href={buildAuthProxyPath("auth/login")}>
                        Logg inn
                    </Button>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, md: 1.5 },
                            marginRight: 1,
                        }}
                    >
                        {isConfigError ? (
                            !isLoadingConfig &&
                            isUserUpserted && (
                                <Box
                                    sx={{
                                        mr: 1.5,
                                    }}
                                >
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
                                <Box sx={{ position: "relative" }}>
                                    <IconButton onClick={() => onProfileOpen()} sx={{ padding: 0 }}>
                                        <UserAvatar userId={"me"} username={user.name} />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </>
        )
    );
}

export default ConfigBar;
