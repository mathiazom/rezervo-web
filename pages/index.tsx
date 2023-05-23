import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Divider, Modal, Stack } from "@mui/material";
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
import { createClassPopularityIndex } from "../lib/popularity";
import WeekNavigator from "../components/WeekNavigator";
import { DateTime } from "luxon";

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

    const { user } = useUser();

    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
    const [userConfigActive, setUserConfigActive] = useState(true);
    const [userConfigActiveLoading, setUserConfigActiveLoading] = useState(false);
    const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig | null>(null);
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);

    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const originalSelectedClassIds = useMemo(
        () => userConfig?.classes?.map(classConfigRecurrentId) ?? [],
        [userConfig?.classes]
    );

    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [isConfigError, setIsConfigError] = useState(false);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);

    const [classInfoClass, setClassInfoClass] = useState<SitClass | null>(null);

    const [cachedSchedules, setCachedSchedules] = useState<{ [weekOffset: number]: SitSchedule }>(
        initialCachedSchedules
    );
    const [weekOffset, setWeekOffset] = useState(0);
    const [currentSchedule, setCurrentSchedule] = useState<SitSchedule>(initialCachedSchedules[0]!);
    const [loadingNextWeek, setLoadingNextWeek] = useState(false);
    const [loadingPreviousWeek, setLoadingPreviousWeek] = useState(false);

    const selectionChanged = useMemo(
        () => !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
        [originalSelectedClassIds, selectedClassIds]
    );

    const classes = useMemo(() => currentSchedule.days.flatMap((d) => d.classes) ?? [], [currentSchedule.days]);

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

    const onSelectedChanged = useCallback((classId: string, selected: boolean) => {
        setSelectedClassIds((s) =>
            selected ? (s.includes(classId) ? s : [...s, classId]) : s.filter((c) => c != classId)
        );
    }, []);

    useEffect(() => {
        if (user != null) {
            getConfig();
        }
    }, [user]);

    useEffect(() => {
        setSelectedClassIds(userConfig?.classes?.map(classConfigRecurrentId) ?? []);
    }, [userConfig]);

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
            setClassInfoClass(linkedClass);
        }
        router.replace({ query: queryWithoutParam });
    }, [router, currentSchedule.days]);

    function getConfig() {
        setIsLoadingConfig(true);
        fetch("/api/config", {
            method: "GET",
        }).then((r) => {
            if (!r.ok) {
                setIsConfigError(true);
                return;
            }
            setIsConfigError(false);
            setIsLoadingConfig(false);
            r.json().then(setUserConfig);
        });
    }

    function putConfig(config: ConfigPayload) {
        setIsLoadingConfig(true);
        return fetch("/api/config", {
            method: "PUT",
            body: JSON.stringify(config, null, 2),
        }).then(() => getConfig());
    }

    function putConfigActive(active: boolean) {
        setUserConfigActive(active);
        setUserConfigActiveLoading(true);
        return fetch("/api/config", {
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

    function putNotificationsConfig(notificationsConfig: NotificationsConfig) {
        setNotificationsConfig(notificationsConfig);
        setNotificationsConfigLoading(true);
        return fetch("/api/config", {
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

    function updateConfigFromSelection() {
        return putConfig({
            active: userConfigActive,
            classes: selectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
            notifications: notificationsConfig,
        });
    }

    async function handleUpdateWeekOffset(modifier: number) {
        switch (modifier) {
            case -1:
                setLoadingPreviousWeek(true);
                break;
            case 1:
                setLoadingNextWeek(true);
                break;
        }
        const currentWeekOffset = modifier === 0 ? 0 : weekOffset + modifier;
        let cachedSchedule = cachedSchedules[currentWeekOffset];
        if (cachedSchedule === undefined) {
            cachedSchedule = await fetch("api/schedule", {
                method: "POST",
                body: JSON.stringify({ weekOffset: currentWeekOffset }),
            }).then((r) => r.json());
            if (cachedSchedule === undefined) {
                setLoadingPreviousWeek(false);
                setLoadingNextWeek(false);
                throw new Error("Failed to fetch schedule");
            }
            setCachedSchedules({ ...cachedSchedules, [currentWeekOffset]: cachedSchedule });
        }
        setWeekOffset(currentWeekOffset);
        setCurrentSchedule(cachedSchedule);
        setLoadingPreviousWeek(false);
        setLoadingNextWeek(false);
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
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <Box display={"flex"} justifyContent={"center"}>
                        <Box width={1388}>
                            <AppBar
                                changed={selectionChanged}
                                agendaEnabled={userConfig?.classes != undefined && userConfig.classes.length > 0}
                                isLoadingConfig={userConfig == null || isLoadingConfig}
                                isConfigError={isConfigError}
                                onUpdateConfig={() => updateConfigFromSelection()}
                                onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                            />
                        </Box>
                    </Box>
                    <WeekNavigator
                        weekNumber={DateTime.fromISO(currentSchedule.days[0]!.date).weekNumber}
                        weekOffset={weekOffset}
                        loadingPreviousWeek={loadingPreviousWeek}
                        loadingNextWeek={loadingNextWeek}
                        onUpdateWeekOffset={handleUpdateWeekOffset}
                    />
                    <Divider orientation="horizontal" />
                </Box>
                <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                    <ScheduleMemo
                        schedule={currentSchedule}
                        classPopularityIndex={classPopularityIndex}
                        selectable={user != null && !isLoadingConfig && !isConfigError}
                        selectedClassIds={selectedClassIds}
                        onSelectedChanged={onSelectedChanged}
                        onInfo={setClassInfoClass}
                    />
                </Box>
                {selectionChanged && (
                    <Box
                        sx={{
                            position: "fixed",
                            padding: "1.5rem",
                            bottom: 0,
                            right: 0,
                        }}
                    >
                        <MobileConfigUpdateBar
                            isLoadingConfig={isLoadingConfig}
                            onUpdateConfig={() => updateConfigFromSelection()}
                            onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                        />
                    </Box>
                )}
            </Stack>
            <Modal open={classInfoClass != null} onClose={() => setClassInfoClass(null)}>
                <>
                    {classInfoClass && (
                        <ClassInfo
                            _class={classInfoClass}
                            classPopularity={
                                classPopularityIndex[sitClassRecurrentId(classInfoClass)] ?? ClassPopularity.Unknown
                            }
                        />
                    )}
                </>
            </Modal>
            <Modal open={isAgendaOpen} onClose={() => setIsAgendaOpen(false)}>
                <>
                    {userConfig?.classes && (
                        <Agenda
                            agendaClasses={userConfig.classes.map((c) => ({
                                config: c,
                                sitClass: classes.find((sc) => sitClassRecurrentId(sc) === classConfigRecurrentId(c)),
                                markedForDeletion: !selectedClassIds.includes(classConfigRecurrentId(c)),
                            }))}
                            onInfo={setClassInfoClass}
                            onSetToDelete={(c, toDelete) => onSelectedChanged(classConfigRecurrentId(c), !toDelete)}
                        />
                    )}
                </>
            </Modal>
            <Modal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
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
