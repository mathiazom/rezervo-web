import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Stack } from "@mui/material";
import Schedule from "../components/Schedule";
import { classConfigRecurrentId, fetchSchedules, sitClassRecurrentId } from "../lib/iBooking";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { ClassConfig, ClassPopularityIndex, ConfigPayload, NotificationsConfig } from "../types/rezervoTypes";
import { arraysAreEqual } from "../utils/arrayUtils";
import { useRouter } from "next/router";
import AppBar from "../components/AppBar";
import MobileConfigUpdateBar from "../components/MobileConfigUpdateBar";
import { createClassPopularityIndex } from "../lib/popularity";
import { DateTime } from "luxon";
import { useUserConfig } from "../hooks/useUserConfig";
import { useUserSessions } from "../hooks/useUserSessions";
import PageHead from "../components/PageHead";
import ClassInfoModal from "../components/modals/ClassInfoModal";
import AgendaModal from "../components/modals/AgendaModal";
import SettingsModal from "../components/modals/SettingsModal";

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

    const { userSessionsIndex } = useUserSessions();

    const [userConfigActive, setUserConfigActive] = useState(true);
    const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig | null>(null);
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[] | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);

    const [classInfoClass, setClassInfoClass] = useState<SitClass | null>(null);

    const [currentSchedule, setCurrentSchedule] = useState<SitSchedule>(initialCachedSchedules[0]!);

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

    return (
        <>
            <PageHead title={"sit-rezervo"} />
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
                    <ScheduleMemo
                        initialCachedSchedules={initialCachedSchedules}
                        schedule={currentSchedule}
                        setCurrentSchedule={setCurrentSchedule}
                        classPopularityIndex={classPopularityIndex}
                        selectable={userConfig != undefined && !userConfigLoading && !userConfigError}
                        selectedClassIds={selectedClassIds}
                        allConfigsIndex={allConfigsIndex ?? null}
                        userSessionsIndex={userSessionsIndex ?? null}
                        onSelectedChanged={onSelectedChanged}
                        onInfo={setClassInfoClass}
                    />
                    <MobileConfigUpdateBar
                        visible={selectionChanged}
                        isLoadingConfig={userConfigLoading}
                        onUpdateConfig={() => updateConfigFromSelection()}
                        onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                    />
                </Box>
            </Stack>
            <ClassInfoModal
                classInfoClass={classInfoClass}
                setClassInfoClass={setClassInfoClass}
                classPopularityIndex={classPopularityIndex}
                allConfigsIndex={allConfigsIndex}
                userSessionsIndex={userSessionsIndex}
            />
            <AgendaModal
                open={isAgendaOpen}
                setOpen={setIsAgendaOpen}
                userConfig={userConfig}
                classes={classes}
                selectedClassIds={selectedClassIds}
                onInfo={setClassInfoClass}
                onSelectedChanged={onSelectedChanged}
            />
            <SettingsModal
                open={isSettingsOpen}
                setOpen={setIsSettingsOpen}
                bookingActive={userConfigActive}
                setBookingActive={setUserConfigActive}
                notificationsConfig={notificationsConfig}
                notificationsConfigLoading={notificationsConfigLoading}
                onNotificationsConfigChanged={putNotificationsConfig}
            />
        </>
    );
};

export default Index;
