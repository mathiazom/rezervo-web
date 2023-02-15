import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Fab,
    FormControlLabel,
    FormGroup,
    Modal,
    Stack,
    Switch,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import { fetchPreviousActivities, fetchSchedule } from "../lib/iBooking";
import { ActivityPopularity } from "../types/derivedTypes";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { useUser } from "@auth0/nextjs-auth0/client";
import LoginIcon from "@mui/icons-material/Login";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LogoutIcon from "@mui/icons-material/Logout";
import IconButton from "@mui/material/IconButton";
import { UserConfig } from "../types/rezervoTypes";
import UndoIcon from "@mui/icons-material/Undo";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import SettingsIcon from "@mui/icons-material/Settings";
import { arraysAreEqual } from "../utils/arrayUtils";

type ConfigPayload = {
    classes: {
        activity: number;
        display_name: string;
        weekday: number;
        studio: number;
        time: {
            hour: number;
            minute: number;
        };
    }[];
};

// Memoize to avoid redundant schedule re-render on class selection change
const ScheduleMemo = memo(Schedule);

export async function getStaticProps() {
    const schedule = await fetchSchedule();
    const previousActivities = await fetchPreviousActivities();
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            schedule,
            previousActivities,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

const Index: NextPage<{
    schedule: SitSchedule;
    previousActivities: ActivityPopularity[];
}> = ({ schedule, previousActivities }) => {
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<
        string[]
    >([]);

    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
    const [userConfigActive, setUserConfigActive] = useState(true);
    const [userConfigActiveLoading, setUserConfigActiveLoading] =
        useState(false);

    useEffect(() => {
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig]);

    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const classes = useMemo(() => {
        return schedule?.days.flatMap((d) => d.classes) ?? [];
    }, [schedule?.days]);

    const onSelectedChanged = useCallback(
        (classId: string, selected: boolean) => {
            if (selected) {
                setSelectedClassIds((s) =>
                    s.includes(classId) ? s : [...s, classId]
                );
            } else {
                setSelectedClassIds((s) => s.filter((c) => c != classId));
            }
        },
        []
    );

    async function getConfig() {
        return fetch("/api/config", {
            method: "GET",
        }).then((r) => r.json());
    }

    useEffect(() => {
        setIsLoadingConfig(true);
        getConfig().then((c) => {
            setUserConfig(c);
        });
    }, []);

    useEffect(() => {
        const configClasses = userConfig?.classes ?? [];
        const selected = classes
            .filter((c) => {
                for (const cc of configClasses) {
                    const date = new Date(c.from);
                    const time = {
                        hour: date.getHours(),
                        minute: date.getMinutes(),
                    };
                    if (
                        cc.activity === c.activityId &&
                        cc.weekday === c.weekday &&
                        cc.time.hour === time.hour &&
                        cc.time.minute === time.minute
                    ) {
                        return true;
                    }
                }
                return false;
            })
            .map((c) => c.id.toString());
        setOriginalSelectedClassIds(selected);
        setSelectedClassIds(selected);
        setIsLoadingConfig(false);
    }, [userConfig]);

    // Pre-generate all class config strings
    const allClassesConfigs = useMemo(() => {
        function timeForClass(_class: SitClass) {
            const date = new Date(_class.from);
            return {
                hour: date.getHours(),
                minute: date.getMinutes(),
            };
        }

        return classes.map((c) => ({
            id: c.id.toString(),
            config: {
                activity: c.activityId,
                display_name: c.name,
                weekday: c.weekday ?? -1,
                studio: c.studio.id,
                time: timeForClass(c),
            },
        }));
    }, [classes]);

    const originalSelectedClassesConfig: ConfigPayload = {
        classes: allClassesConfigs
            .filter(({ id }) => originalSelectedClassIds.includes(id))
            .map(({ config }) => config),
    };

    const selectedClassesConfig: ConfigPayload = {
        classes: allClassesConfigs
            .filter(({ id }) => selectedClassIds.includes(id))
            .map(({ config }) => config),
    };

    async function putConfig(config: ConfigPayload) {
        return await fetch("/api/config", {
            method: "PUT",
            body: JSON.stringify(config, null, 2),
        });
    }

    async function putConfigActive(active: boolean) {
        setUserConfigActive(active);
        setUserConfigActiveLoading(true);
        return await fetch("/api/config", {
            method: "PUT",
            body: JSON.stringify(
                {
                    ...originalSelectedClassesConfig,
                    active,
                },
                null,
                2
            ),
        })
            .then((r) => r.json())
            .then((c: UserConfig) => {
                setUserConfigActive(c.active);
                setUserConfigActiveLoading(false);
            });
    }

    async function onUpdateConfig(config: ConfigPayload) {
        setIsLoadingConfig(true);
        putConfig(config).then(() => {
            getConfig().then((c) => {
                setUserConfig(c);
            });
        });
    }

    const theme = useTheme();

    const { user, isLoading } = useUser();

    const changed = !arraysAreEqual(
        selectedClassIds.sort(),
        originalSelectedClassIds.sort()
    );

    return (
        <>
            <Head>
                <title>sit-rezervo</title>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link rel="manifest" href="/site.webmanifest" />
                <link
                    rel="mask-icon"
                    href="/safari-pinned-tab.svg"
                    color="#5bbad5"
                />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <Stack divider={<Divider orientation="horizontal" flexItem />}>
                <Box height={"8vh"} display="flex" alignItems={"center"}>
                    <Typography
                        component="div"
                        py={2}
                        pl={3}
                        sx={{
                            fontSize: { xs: "1.2rem", sm: "1.8rem" },
                            display: { xs: "none", md: "block" },
                        }}
                    >
                        <strong style={{ color: theme.palette.primary.main }}>
                            sit-rezervo
                        </strong>
                    </Typography>
                    {!isLoading && (
                        <Box sx={{ marginLeft: "auto", marginRight: 4 }}>
                            {user ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
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
                                                <IconButton
                                                    onClick={() =>
                                                        setSelectedClassIds(
                                                            originalSelectedClassIds
                                                        )
                                                    }
                                                >
                                                    <UndoIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Button
                                                variant={"contained"}
                                                startIcon={<CloudUploadIcon />}
                                                onClick={() =>
                                                    onUpdateConfig(
                                                        selectedClassesConfig
                                                    )
                                                }
                                            >
                                                Oppdater
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
                                            gap: 2,
                                        }}
                                    >
                                        <Tooltip title={"Innstillinger"}>
                                            <IconButton
                                                onClick={() =>
                                                    setSettingsOpen(true)
                                                }
                                            >
                                                <SettingsIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {user.name && (
                                            <Tooltip title={user.name}>
                                                <Avatar
                                                    sx={{
                                                        backgroundColor:
                                                            theme.palette
                                                                .primary.main,
                                                    }}
                                                >
                                                    {user.name[0]}
                                                </Avatar>
                                            </Tooltip>
                                        )}
                                        <Tooltip title={"Logg ut"}>
                                            <IconButton
                                                href={"/api/auth/logout"}
                                            >
                                                <LogoutIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ backgroundColor: "grey" }}>
                                    <Tooltip title={"Logg inn"}>
                                        <IconButton
                                            color={"primary"}
                                            href={"/api/auth/login"}
                                        >
                                            <LoginIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    <Container
                        maxWidth={false}
                        sx={{ height: "92vh", overflow: "auto" }}
                    >
                        <ScheduleMemo
                            schedule={schedule}
                            previousActivities={previousActivities}
                            selectable={user != null}
                            selectedClassIds={selectedClassIds}
                            onSelectedChanged={onSelectedChanged}
                        />
                    </Container>
                </Stack>
                {changed && (
                    <Box
                        sx={{
                            position: "fixed",
                            padding: "1.5rem",
                            bottom: 0,
                            right: 0,
                            gap: 1,
                            display: { xs: "flex", sm: "none" },
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {isLoadingConfig ? (
                            <Fab color={"primary"} size="small">
                                <CircularProgress
                                    sx={{ color: "white" }}
                                    size={26}
                                    thickness={6}
                                />
                            </Fab>
                        ) : (
                            <>
                                <Fab
                                    size="small"
                                    onClick={() =>
                                        setSelectedClassIds(
                                            originalSelectedClassIds
                                        )
                                    }
                                >
                                    <UndoIcon sx={{ fontSize: 18 }} />
                                </Fab>
                                <Fab
                                    color={"primary"}
                                    variant="extended"
                                    onClick={() =>
                                        onUpdateConfig(selectedClassesConfig)
                                    }
                                >
                                    <CloudUploadIcon sx={{ mr: 1 }} />
                                    Oppdater
                                </Fab>
                            </>
                        )}
                    </Box>
                )}
            </Stack>
            <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "90%",
                        maxHeight: "80%",
                        overflowY: "scroll",
                        maxWidth: 520,
                        transform: "translate(-50%, -50%)",
                        backgroundColor:
                            theme.palette.mode === "dark" ? "#212121" : "white",
                        borderRadius: "0.25em",
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            paddingBottom: 1,
                        }}
                    >
                        <Typography variant="h6" component="h2">
                            Innstillinger
                        </Typography>
                    </Box>
                    <Box pt={2} pb={2}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={userConfigActive}
                                        onChange={(_, checked) =>
                                            putConfigActive(checked)
                                        }
                                        inputProps={{
                                            "aria-label": "controlled",
                                        }}
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                        }}
                                    >
                                        <span>Aktiv</span>
                                        {userConfigActiveLoading && (
                                            <CircularProgress size="1.5rem" />
                                        )}
                                    </Box>
                                }
                            />
                        </FormGroup>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default Index;
