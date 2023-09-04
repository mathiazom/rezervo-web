import { useUser } from "@auth0/nextjs-auth0/client";
import { RocketLaunchRounded } from "@mui/icons-material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import LoginIcon from "@mui/icons-material/Login";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import UndoIcon from "@mui/icons-material/Undo";
import { Avatar, Badge, Box, Button, CircularProgress, Tooltip, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { useMemo } from "react";

import MobileConfigUpdateBar from "@/components/configuration/MobileConfigUpdateBar";
import { useIntegrationUser } from "@/lib/hooks/useIntegrationUser";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { IntegrationIdentifier } from "@/lib/integrations/active";
import { classConfigRecurrentId, classRecurrentId, zeroIndexedWeekday } from "@/lib/integrations/common";
import { arraysAreEqual } from "@/lib/utils/arrayUtils";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { ClassConfig, IntegrationConfig, RezervoClass } from "@/types/rezervo";

function ConfigBar({
    integration,
    classes,
    selectedClassIds,
    originalSelectedClassIds,
    userConfig,
    userConfigActive,
    isLoadingConfig,
    isConfigError,
    onUndoSelectionChanges,
    onSettingsOpen,
    onIntegrationUserSettingsOpen,
    onAgendaOpen,
}: {
    integration: IntegrationIdentifier;
    classes: RezervoClass[];
    selectedClassIds: string[] | null;
    originalSelectedClassIds: string[] | null;
    userConfig: IntegrationConfig | undefined;
    userConfigActive: boolean;
    isLoadingConfig: boolean;
    isConfigError: boolean;
    onUndoSelectionChanges: () => void;
    onSettingsOpen: () => void;
    onIntegrationUserSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    const { user, isLoading } = useUser();
    const { integrationUserMissing } = useIntegrationUser(integration);
    const { userConfigMissing, putUserConfig } = useUserConfig(integration);

    const selectionChanged = useMemo(
        () =>
            selectedClassIds != null &&
            originalSelectedClassIds != null &&
            !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
        [originalSelectedClassIds, selectedClassIds],
    );

    // Pre-generate all class config strings
    const allClassesConfigMap = useMemo(() => {
        const classesConfigMap = classes.reduce<{ [id: string]: ClassConfig }>((o, c) => {
            const { hour, minute, weekday } = c.startTime;
            return {
                ...o,
                [classRecurrentId(c)]: {
                    activity: c.activity.id,
                    display_name: c.activity.name,
                    weekday: zeroIndexedWeekday(weekday),
                    studio: c.location.id,
                    time: { hour, minute },
                },
            };
        }, {});
        // Locate any class configs from the user config that do not exist in the current schedule
        const ghostClassesConfigs =
            userConfig?.classes
                ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
                .reduce<{ [id: string]: ClassConfig }>(
                    (o, c) => ({
                        ...o,
                        [classConfigRecurrentId(c)]: c,
                    }),
                    {},
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
                    {integrationUserMissing ? (
                        <Box>
                            <Tooltip title={`Konfigurer ${integration}-bruker`}>
                                <IconButton onClick={() => onIntegrationUserSettingsOpen()}>
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
