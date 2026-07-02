import { CalendarMonth, CalendarToday, PauseCircleRounded, People } from "@mui/icons-material";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import LoginIcon from "@mui/icons-material/Login";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Badge, Box, Tooltip, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useEffect, useRef, useState } from "react";

import AgendaModal from "@/components/modals/Agenda/AgendaModal";
import CommunityModal from "@/components/modals/Community/CommunityModal";
import ProfileModal from "@/components/modals/Profile/ProfileModal";
import SettingsModal from "@/components/modals/Settings/SettingsModal";
import { UserAvatar } from "@/components/utils/UserAvatar";
import { useCommunity } from "@/lib/hooks/useCommunity";
import { useMyUser } from "@/lib/hooks/useMyUser";
import { useUser } from "@/lib/hooks/useUser";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { vars } from "@/lib/theme";
import { UserRelationship } from "@/types/openapi";
import { useUserConfig } from "@/lib/hooks/useUserConfig";

function ConfigBar({ chainIdentifier }: { chainIdentifier: string }) {
    const theme = useTheme();
    const { user, authStatus, logIn } = useUser();
    const { userId: myUserId, userName: backendUserName } = useMyUser();
    const userName = backendUserName ?? user?.name ?? null;
    const [isUserUpserted, setIsUserUpserted] = useState(false);
    const configRefetchedRef = useRef(false);
    const { community } = useCommunity();
    const { userConfigError, userConfigLoading, mutateUserConfig } = useUserConfig(chainIdentifier);
    const { userChainConfigs } = useUserChainConfigs();
    const { userSessions } = useUserSessions();
    const [activeModal, setActiveModal] = useState<"community" | "settings" | "agenda" | "profile" | null>(null);
    const closeModal = () => setActiveModal(null);
    const friendRequestCount =
        community?.users.filter((cu) => cu.relationship === UserRelationship.REQUEST_RECEIVED).length ?? 0;

    const configsArray = userChainConfigs == null ? [] : Object.values(userChainConfigs);
    const bookingPaused = configsArray.length > 0 && configsArray.every((config) => !config.active);

    useEffect(() => {
        if (myUserId != null && !configRefetchedRef.current) {
            configRefetchedRef.current = true;
            void mutateUserConfig().then(() => setIsUserUpserted(true));
        }
    }, [myUserId, mutateUserConfig]);

    return (
        authStatus != "loading" && (
            <>
                {authStatus === "unauthenticated" ? (
                    <Button endIcon={<LoginIcon />} onClick={() => logIn()}>
                        Logg inn
                    </Button>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1, md: 1.5 },
                                marginRight: 1,
                            }}
                        >
                            {userConfigError != null ? (
                                !userConfigLoading &&
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
                                            <IconButton onClick={() => setActiveModal("community")}>
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
                                                onClick={() => setActiveModal("agenda")}
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
                                                <IconButton onClick={() => setActiveModal("agenda")}>
                                                    {(userSessions?.length ?? 0) > 0 ? (
                                                        <CalendarMonth />
                                                    ) : (
                                                        <CalendarToday />
                                                    )}
                                                </IconButton>
                                            </Badge>
                                        </Tooltip>
                                        <Tooltip title={"Innstillinger"}>
                                            <IconButton onClick={() => setActiveModal("settings")}>
                                                <SettingsRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </>
                            )}
                            {userName && (
                                <Tooltip title={userName}>
                                    <Box sx={{ position: "relative" }}>
                                        <IconButton onClick={() => setActiveModal("profile")} sx={{ padding: 0 }}>
                                            <UserAvatar userId={"me"} username={userName} />
                                        </IconButton>
                                    </Box>
                                </Tooltip>
                            )}
                        </Box>
                        <CommunityModal open={activeModal === "community"} onClose={closeModal} />
                        <AgendaModal open={activeModal === "agenda"} onClose={closeModal} />
                        <SettingsModal open={activeModal === "settings"} onClose={closeModal} />
                        <ProfileModal open={activeModal === "profile"} onClose={closeModal} />
                    </>
                )}
            </>
        )
    );
}

export default ConfigBar;
