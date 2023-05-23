import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Divider, Modal, Stack, Typography, useTheme } from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import { classConfigRecurrentId, fetchSchedules, sitClassRecurrentId } from "../lib/iBooking";
import { ClassPopularityIndex, ClassPopularity } from "../types/derivedTypes";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ClassConfig, ConfigPayload, NotificationsConfig, UserConfig } from "../types/rezervoTypes";
import { arraysAreEqual } from "../utils/arrayUtils";
import Settings from "../components/Settings";
import { useRouter } from "next/router";
import AppBar from "../components/AppBar";
import MobileConfigUpdateBar from "../components/MobileConfigUpdateBar";
import ClassInfo from "../components/ClassInfo";
import Agenda from "../components/Agenda";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { DateTime } from "luxon";
import { createClassPopularityIndex } from "../lib/popularity";

// Memoize to avoid redundant schedule re-render on class selection change
const ScheduleMemo = memo(Schedule);

export async function getStaticProps() {
    const initialCachedSchedules = await fetchSchedules([-1, 0, 1, 2, 3]);
    const classPopularityIndex = await createClassPopularityIndex(initialCachedSchedules[-1]!);
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            initialCachedSchedules,
            classPopularityIndex,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

const Index: NextPage<{
    initialCachedSchedules: { [weekOffset: number]: SitSchedule };
    classPopularityIndex: ClassPopularityIndex;
}> = ({ initialCachedSchedules, classPopularityIndex }) => {
    const router = useRouter();
    const theme = useTheme();

    const { user } = useUser();

    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[]>([]);

    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

    const [userConfigActive, setUserConfigActive] = useState(true);
    const [userConfigActiveLoading, setUserConfigActiveLoading] = useState(false);

    const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig | null>(null);
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);

    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [agendaOpen, setAgendaOpen] = useState(false);

    const [modalClass, setModalClass] = useState<SitClass | null>(null);

    const [cachedSchedules, setCachedSchedules] = useState<{ [weekOffset: number]: SitSchedule }>(
        initialCachedSchedules
    );
    const [currentSchedule, setCurrentSchedule] = useState<SitSchedule>(initialCachedSchedules[0]!);
    const [weekOffset, setWeekOffset] = useState(0);
    const handleUpdateWeekOffset = async (modifier: number) => {
        const currentWeekOffset = modifier === 0 ? 0 : weekOffset + modifier;
        let cachedSchedule = cachedSchedules[currentWeekOffset];

        if (cachedSchedule === undefined) {
            cachedSchedule = await (
                await fetch("api/schedule", {
                    method: "POST",
                    body: JSON.stringify({ weekOffset: currentWeekOffset }),
                })
            ).json();
            if (cachedSchedule === undefined) {
                throw new Error("Failed to fetch schedule");
            }

            setCachedSchedules({ ...cachedSchedules, [currentWeekOffset]: cachedSchedule });
        }

        setWeekOffset(currentWeekOffset);
        setCurrentSchedule(cachedSchedule);
    };

    const selectionChanged = useMemo(
        () => !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
        [originalSelectedClassIds, selectedClassIds]
    );

    const classes = useMemo(() => {
        return currentSchedule.days.flatMap((d) => d.classes) ?? [];
    }, [currentSchedule.days]);

    const onSelectedChanged = useCallback((classId: string, selected: boolean) => {
        if (selected) {
            setSelectedClassIds((s) => (s.includes(classId) ? s : [...s, classId]));
        } else {
            setSelectedClassIds((s) => s.filter((c) => c != classId));
        }
    }, []);

    useEffect(() => {
        if (user == null) {
            return;
        }
        setIsLoadingConfig(true);
        getConfig().then((c) => {
            setUserConfig(c);
        });
    }, [user]);

    useEffect(() => {
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig]);

    useEffect(() => {
        setNotificationsConfig(userConfig?.notifications ?? null);
    }, [userConfig]);

    useEffect(() => {
        const { classId, ...queryWithoutParam } = router.query;
        if (classId === undefined) {
            return;
        }
        const linkedClass = currentSchedule.days
            .flatMap((day) => day.classes)
            .find((_class) => _class.id === Number(classId));
        if (linkedClass) {
            setModalClass(linkedClass);
        }
        router.replace({ query: queryWithoutParam });
    }, [router, currentSchedule.days]);

    useEffect(() => {
        setOriginalSelectedClassIds(userConfig?.classes?.map(classConfigRecurrentId) ?? []);
        setSelectedClassIds(userConfig?.classes?.map(classConfigRecurrentId) ?? []);
        setIsLoadingConfig(false);
    }, [userConfig]);

    async function getConfig() {
        return fetch("/api/config", {
            method: "GET",
        }).then((r) => r.json());
    }

    // Pre-generate all class config strings
    const allClassesConfigMap = useMemo(() => {
        function timeForClass(_class: SitClass) {
            const date = new Date(_class.from);
            return {
                hour: date.getHours(),
                minute: date.getMinutes(),
            };
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
                    classes: originalSelectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
                    active,
                } as ConfigPayload,
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

    async function putNotificationsConfig(notificationsConfig: NotificationsConfig) {
        setNotificationsConfig(notificationsConfig);
        setNotificationsConfigLoading(true);
        return await fetch("/api/config", {
            method: "PUT",
            body: JSON.stringify(
                {
                    active: userConfigActive,
                    classes: originalSelectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
                    notifications: notificationsConfig,
                } as ConfigPayload,
                null,
                2
            ),
        })
            .then((r) => r.json())
            .then((c: UserConfig) => {
                setNotificationsConfig(c.notifications);
                setNotificationsConfigLoading(false);
            });
    }

    async function updateConfigFromSelection() {
        setIsLoadingConfig(true);
        putConfig({
            active: userConfigActive,
            classes: selectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
            notifications: notificationsConfig,
        }).then(() => {
            getConfig().then((c) => {
                setUserConfig(c);
            });
        });
    }

    return (
        <>
            <Head>
                <title>sit-rezervo</title>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <Stack>
                <Box display={"flex"} justifyContent={"center"}>
                    <Box width={1388}>
                        <AppBar
                            changed={selectionChanged}
                            agendaEnabled={userConfig?.classes != undefined && userConfig.classes.length > 0}
                            isLoadingConfig={isLoadingConfig}
                            onUpdateConfig={() => updateConfigFromSelection()}
                            onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                            onSettingsOpen={() => setSettingsOpen(true)}
                            onAgendaOpen={() => setAgendaOpen(true)}
                        />
                    </Box>
                </Box>
                <Stack>
                    <Stack
                        direction={"row"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        mb={1}
                        sx={{ position: "relative" }}
                    >
                        <Button variant={"outlined"} size={"small"} onClick={() => handleUpdateWeekOffset(-1)}>
                            <ArrowBack />
                        </Button>
                        <Typography
                            sx={{ opacity: 0.7 }}
                            mx={2}
                            variant={"subtitle2"}
                            color={theme.palette.primary.contrastText}
                        >{`UKE ${DateTime.fromISO(currentSchedule.days[0]!.date).weekNumber}`}</Typography>
                        <Button variant={"outlined"} size={"small"} onClick={() => handleUpdateWeekOffset(1)}>
                            <ArrowForward />
                        </Button>
                        <Button
                            sx={{
                                ml: 1,
                                position: { xs: "absolute", md: "inherit" },
                                right: { xs: 10, md: "inherit" },
                            }}
                            variant={"outlined"}
                            size={"small"}
                            disabled={weekOffset === 0}
                            onClick={() => handleUpdateWeekOffset(0)}
                        >
                            I dag
                        </Button>
                    </Stack>
                </Stack>
                <Divider orientation="horizontal" flexItem />
                <Stack direction={{ xs: "column", md: "row" }} divider={<Divider orientation="vertical" flexItem />}>
                    <Container maxWidth={false} sx={{ height: "85vh", overflow: "auto", padding: "0 !important" }}>
                        <ScheduleMemo
                            schedule={currentSchedule}
                            classPopularityIndex={classPopularityIndex}
                            selectable={user != null && !isLoadingConfig}
                            selectedClassIds={selectedClassIds}
                            onSelectedChanged={onSelectedChanged}
                            onInfo={setModalClass}
                        />
                    </Container>
                </Stack>
                {selectionChanged && (
                    <MobileConfigUpdateBar
                        isLoadingConfig={isLoadingConfig}
                        onUpdateConfig={() => updateConfigFromSelection()}
                        onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                    />
                )}
            </Stack>
            <Modal open={modalClass != null} onClose={() => setModalClass(null)}>
                <>
                    {modalClass && (
                        <ClassInfo
                            _class={modalClass}
                            classPopularity={
                                classPopularityIndex[sitClassRecurrentId(modalClass)] ?? ClassPopularity.Unknown
                            }
                        />
                    )}
                </>
            </Modal>
            <Modal open={agendaOpen} onClose={() => setAgendaOpen(false)}>
                <>
                    {userConfig?.classes && (
                        <Agenda
                            agendaClasses={userConfig.classes.map((c) => ({
                                config: c,
                                sitClass: classes.find((sc) => sitClassRecurrentId(sc) === classConfigRecurrentId(c)),
                                markedForDeletion: !selectedClassIds.includes(classConfigRecurrentId(c)),
                            }))}
                            onInfo={setModalClass}
                            onSetToDelete={(c, toDelete) => onSelectedChanged(classConfigRecurrentId(c), !toDelete)}
                        />
                    )}
                </>
            </Modal>
            <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
                <Settings
                    bookingActive={userConfigActive}
                    bookingActiveLoading={userConfigActiveLoading}
                    onBookingActiveChanged={putConfigActive}
                    notificationsConfig={notificationsConfig}
                    notificationsConfigLoading={notificationsConfigLoading}
                    onNotificationsConfigChanged={putNotificationsConfig}
                />
            </Modal>
        </>
    );
};

export default Index;
