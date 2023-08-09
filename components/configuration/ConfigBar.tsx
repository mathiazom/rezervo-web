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
import React, { useMemo } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import MobileConfigUpdateBar from "./MobileConfigUpdateBar";
import { arraysAreEqual } from "../../utils/arrayUtils";
import { SitClass } from "../../types/integration/sit";
import { DateTime } from "luxon";
import { ClassConfig, NotificationsConfig, UserConfig } from "../../types/rezervo";
import { classConfigRecurrentId, sitClassRecurrentId } from "../../lib/iBooking";
import { useUserConfig } from "../../hooks/useUserConfig";

function ConfigBar({
    classes,
    selectedClassIds,
    originalSelectedClassIds,
    userConfig,
    userConfigActive,
    notificationsConfig,
    isLoadingConfig,
    isConfigError,
    onUndoSelectionChanges,
    onSettingsOpen,
    onAgendaOpen,
}: {
    classes: SitClass[];
    selectedClassIds: string[] | null;
    originalSelectedClassIds: string[] | null;
    userConfig: UserConfig | undefined;
    userConfigActive: boolean;
    notificationsConfig: NotificationsConfig | null;
    isLoadingConfig: boolean;
    isConfigError: boolean;
    onUndoSelectionChanges: () => void;
    onSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    const { user, isLoading } = useUser();
    const { putUserConfig } = useUserConfig();

    const selectionChanged = useMemo(
        () =>
            selectedClassIds != null &&
            originalSelectedClassIds != null &&
            !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
        [originalSelectedClassIds, selectedClassIds]
    );

    // Pre-generate all class config strings
    const allClassesConfigMap = useMemo(() => {
        function timeForClass(_class: SitClass) {
            const { hour, minute } = DateTime.fromISO(_class.from);
            return { hour, minute };
        }
        const classesConfigMap = classes.reduce<{ [id: string]: ClassConfig }>(
            (o, c) => ({
                ...o,
                [sitClassRecurrentId(c)]: {
                    activity: c.activityId,
                    display_name: c.name,
                    weekday: c.weekday ?? -1,
                    studio: c.studio.id,
                    time: timeForClass(c),
                },
            }),
            {}
        );
        // Locate any class configs from the user config that do not exist in the current schedule
        const ghostClassesConfigs =
            userConfig?.classes
                ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
                .reduce<{ [id: string]: ClassConfig }>(
                    (o, c) => ({
                        ...o,
                        [classConfigRecurrentId(c)]: c,
                    }),
                    {}
                ) ?? {};
        return { ...classesConfigMap, ...ghostClassesConfigs };
    }, [classes, userConfig?.classes]);

    function onUpdateConfig() {
        if (selectedClassIds == null) {
            return;
        }
        return putUserConfig({
            active: userConfigActive,
            classes: selectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
            notifications: notificationsConfig,
        });
    }

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
                visible={selectionChanged}
                isLoadingConfig={isLoadingConfig}
                onUpdateConfig={onUpdateConfig}
                onUndoSelectionChanges={onUndoSelectionChanges}
            />
        </>
    );
}

export default ConfigBar;
