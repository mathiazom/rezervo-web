import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { classConfigRecurrentId, fetchSchedules, sitClassRecurrentId } from "../lib/iBooking";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { ClassConfig, ClassPopularityIndex, NotificationsConfig } from "../types/rezervoTypes";
import { arraysAreEqual } from "../utils/arrayUtils";
import AppBar from "../components/AppBar";
import MobileConfigUpdateBar from "../components/MobileConfigUpdateBar";
import { createClassPopularityIndex } from "../lib/popularity";
import { DateTime } from "luxon";
import { useUserConfig } from "../hooks/useUserConfig";
import PageHead from "../components/utils/PageHead";
import ClassInfoModal from "../components/modals/ClassInfo/ClassInfoModal";
import AgendaModal from "../components/modals/Agenda/AgendaModal";
import SettingsModal from "../components/modals/Settings/SettingsModal";
import WeekNavigator from "../components/schedule/WeekNavigator";
import WeekSchedule from "../components/schedule/WeekSchedule";

// Memoize to avoid redundant schedule re-render on class selection change
const WeekScheduleMemo = memo(WeekSchedule);

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
    const { userConfig, userConfigError, userConfigLoading, putUserConfig, allConfigsIndex } = useUserConfig();

    const [userConfigActive, setUserConfigActive] = useState(true);
    const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig | null>(null);

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
                    <WeekNavigator
                        initialCachedSchedules={initialCachedSchedules}
                        setCurrentSchedule={setCurrentSchedule}
                    />
                    <Divider orientation="horizontal" />
                    <WeekScheduleMemo
                        currentSchedule={currentSchedule}
                        classPopularityIndex={classPopularityIndex}
                        selectable={userConfig != undefined && !userConfigLoading && !userConfigError}
                        selectedClassIds={selectedClassIds}
                        allConfigsIndex={allConfigsIndex ?? null}
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
                setNotificationsConfig={setNotificationsConfig}
            />
        </>
    );
};

export default Index;
