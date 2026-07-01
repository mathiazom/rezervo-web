import { CalendarMonth, CalendarToday, PauseCircleRounded, People } from "@mui/icons-material";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LoginIcon from "@mui/icons-material/Login";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Badge, Box, Tooltip, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/utils/UserAvatar";
import { useCommunity } from "@/lib/hooks/useCommunity";
import { useMyUser } from "@/lib/hooks/useMyUser";
import { useUser } from "@/lib/hooks/useUser";
import { vars } from "@/lib/theme";
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
    const { user, authStatus, logIn } = useUser();
    const { userId: myUserId, userName: backendUserName } = useMyUser();
    const userName = backendUserName ?? user?.name ?? null;
    const [isUserUpserted, setIsUserUpserted] = useState(false);
    const configRefetchedRef = useRef(false);
    const { community } = useCommunity();
    const friendRequestCount =
        community?.users.filter((cu) => cu.relationship === UserRelationship.REQUEST_RECEIVED).length ?? 0;

    const configsArray = chainConfigs == null ? [] : Object.values(chainConfigs);
    const bookingPaused = configsArray.length > 0 && configsArray.every((config) => !config.active);

    useEffect(() => {
        if (myUserId != null && !configRefetchedRef.current) {
            configRefetchedRef.current = true;
            void onRefetchConfig().then(() => setIsUserUpserted(true));
        }
    }, [myUserId, onRefetchConfig]);

    return (
        authStatus != "loading" && (
            <>
                {authStatus === "unauthenticated" ? (
                    <Button endIcon={<LoginIcon />} onClick={() => logIn()}>
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
                                                        backgroundColor: vars(theme).palette.background.default,
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
                        {userName && (
                            <Tooltip title={userName}>
                                <Box sx={{ position: "relative" }}>
                                    <IconButton onClick={() => onProfileOpen()} sx={{ padding: 0 }}>
                                        <UserAvatar userId={"me"} username={userName} />
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
