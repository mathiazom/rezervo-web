import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Divider, Modal, Stack } from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import { classConfigRecurrentId, fetchSchedules, sitClassRecurrentId } from "../lib/iBooking";
import { SitClass, SitSchedule } from "../types/sitTypes";
import {
    ClassConfig,
    ClassPopularity,
    ClassPopularityIndex,
    ConfigPayload,
    NotificationsConfig,
} from "../types/rezervoTypes";
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
import { useUserConfig } from "../hooks/useUserConfig";
import { useUserSessions } from "../hooks/useUserSessions";

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

    const { userConfig, userConfigError, userConfigLoading, putUserConfig, allConfigsIndex } = useUserConfig();

    const { userSessionsIndex, mutateSessionsIndex } = useUserSessions();

    const [userConfigActive, setUserConfigActive] = useState(true);
    const [userConfigActiveLoading, setUserConfigActiveLoading] = useState(false);
    const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig | null>(null);
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[] | null>(null);

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
        () =>
            selectedClassIds != null &&
            originalSelectedClassIds != null &&
            !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
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
            s == null ? s : selected ? (s.includes(classId) ? s : [...s, classId]) : s.filter((c) => c != classId)
        );
    }, []);

    useEffect(() => {
        const classIds = userConfig?.classes?.map(classConfigRecurrentId) ?? null;
        setSelectedClassIds(classIds);
        setOriginalSelectedClassIds(classIds);
        setUserConfigActive(userConfig?.active ?? false);
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

    function putConfigActive(active: boolean) {
        setUserConfigActive(active);
        setUserConfigActiveLoading(true);
        return putUserConfig({
            ...userConfig,
            active,
        } as ConfigPayload).then(() => setUserConfigActiveLoading(false));
    }

    function putNotificationsConfig(notificationsConfig: NotificationsConfig) {
        setNotificationsConfig(notificationsConfig);
        setNotificationsConfigLoading(true);
        return putUserConfig({
            ...userConfig,
            notifications: notificationsConfig,
        } as ConfigPayload).then(() => setNotificationsConfigLoading(false));
    }

    function updateConfigFromSelection() {
        if (selectedClassIds == null) {
            return;
        }
        return putUserConfig({
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
        // Pre-fetch next schedule (in same direction) if not in cache
        const nextWeekOffset = currentWeekOffset + modifier;
        if (nextWeekOffset in cachedSchedules) {
            return;
        }
        const nextSchedule = await fetch("api/schedule", {
            method: "POST",
            body: JSON.stringify({ weekOffset: nextWeekOffset }),
        }).then((r) => r.json());
        if (nextSchedule != undefined) {
            setCachedSchedules({ ...cachedSchedules, [nextWeekOffset]: nextSchedule });
        }
    }

    function bookClass(classId: number) {
        return fetch("/api/book", {
            method: "POST",
            body: JSON.stringify({ class_id: classId.toString() }, null, 2),
        }).then(() => mutateSessionsIndex());
    }

    function cancelBooking(classId: number) {
        return fetch("/api/cancelBooking", {
            method: "POST",
            body: JSON.stringify({ class_id: classId.toString() }, null, 2),
        }).then(() => mutateSessionsIndex());
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
                    <AppBar
                        changed={selectionChanged}
                        agendaEnabled={userConfig?.classes != undefined && userConfig.classes.length > 0}
                        isLoadingConfig={userConfig == null || userConfigLoading}
                        isConfigError={userConfigError}
                        onUpdateConfig={() => updateConfigFromSelection()}
                        onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                        onSettingsOpen={() => setIsSettingsOpen(true)}
                        onAgendaOpen={() => setIsAgendaOpen(true)}
                    />
                    <WeekNavigator
                        weekNumber={DateTime.fromISO(currentSchedule.days[0]!.date).weekNumber}
                        weekOffset={weekOffset}
                        loadingPreviousWeek={loadingPreviousWeek}
                        loadingNextWeek={loadingNextWeek}
                        onUpdateWeekOffset={handleUpdateWeekOffset}
                    />
                    <Divider orientation="horizontal" />
                </Box>
                <ScheduleMemo
                    schedule={currentSchedule}
                    classPopularityIndex={classPopularityIndex}
                    selectable={userConfig != undefined && !userConfigLoading && !userConfigError}
                    selectedClassIds={selectedClassIds}
                    allConfigsIndex={allConfigsIndex ?? null}
                    userSessionsIndex={userSessionsIndex ?? null}
                    onSelectedChanged={onSelectedChanged}
                    onInfo={setClassInfoClass}
                />
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
                            isLoadingConfig={userConfigLoading}
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
                            configUsers={
                                allConfigsIndex ? allConfigsIndex[sitClassRecurrentId(classInfoClass)] ?? [] : []
                            }
                            userSessions={userSessionsIndex ? userSessionsIndex[classInfoClass.id] ?? [] : []}
                            onBook={() => bookClass(classInfoClass.id)}
                            onCancelBooking={() => cancelBooking(classInfoClass.id)}
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
                                markedForDeletion:
                                    selectedClassIds != null && !selectedClassIds.includes(classConfigRecurrentId(c)),
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
