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
import React, { useEffect, useState } from "react";

import { useCommunity } from "@/lib/hooks/useCommunity";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { ChainIdentifier } from "@/types/chain";
import { UserRelationship } from "@/types/community";
import { ChainConfig } from "@/types/config";
import { UserAgendaClass } from "@/types/userSessions";

function ConfigBar({
    chainConfigs,
    agenda,
    isLoadingConfig,
    isConfigError,
    onCommunityOpen,
    onSettingsOpen,
    onAgendaOpen,
}: {
    chainConfigs: Record<ChainIdentifier, ChainConfig> | null;
    agenda: UserAgendaClass[] | null;
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
    const [bookingPaused, setBookingPaused] = useState<boolean>(false);

    useEffect(() => {
        if (chainConfigs !== null) {
            const inactiveChains = Object.keys(chainConfigs).filter(
                (chain) => !chainConfigs[chain as ChainIdentifier]?.active,
            ) as ChainIdentifier[];
            setBookingPaused(inactiveChains.length > 0 && Object.keys(chainConfigs).length === inactiveChains.length);
        }
    }, [chainConfigs]);

    useEffect(() => {
        fetch("/api/user", {
            method: "PUT",
        });
    }, []);

    return (
        <>
            {!isLoading && !user && (
                <Button endIcon={<LoginIcon />} href={"/api/auth/login"}>
                    Logg inn
                </Button>
            )}
            {!isLoading && user && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, md: 1.5 },
                    }}
                >
                    {!isLoadingConfig && isConfigError && (
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
                    )}
                    {!isConfigError && (
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
                                            {(agenda?.length ?? 0) > 0 ? <CalendarMonth /> : <CalendarToday />}
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
    );
}

export default ConfigBar;
