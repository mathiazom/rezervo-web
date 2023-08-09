import { useUserConfig } from "../hooks/useUserConfig";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ClassPopularityIndex, NotificationsConfig } from "../types/rezervoTypes";
import { SitClass, SitSchedule } from "../types/integration/sit";
import { classConfigRecurrentId } from "../lib/iBooking";
import PageHead from "./utils/PageHead";
import { Box, Divider, Stack } from "@mui/material";
import AppBar from "./utils/AppBar";
import Logo from "./utils/Logo";
import ConfigBar from "./configuration/ConfigBar";
import WeekNavigator from "./schedule/WeekNavigator";
import ClassInfoModal from "./modals/ClassInfo/ClassInfoModal";
import AgendaModal from "./modals/Agenda/AgendaModal";
import SettingsModal from "./modals/Settings/SettingsModal";
import WeekSchedule from "./schedule/WeekSchedule";

// Memoize to avoid redundant schedule re-render on class selection change
const WeekScheduleMemo = memo(WeekSchedule);
function Integration({
    initialCachedSchedules,
    classPopularityIndex,
    acronym,
}: {
    initialCachedSchedules: { [weekOffset: number]: SitSchedule };
    classPopularityIndex: ClassPopularityIndex;
    acronym: string;
}) {
    const { userConfig, userConfigError, userConfigLoading, allConfigsIndex } = useUserConfig();

    const [userConfigActive, setUserConfigActive] = useState(true);
    const [notificationsConfig, setNotificationsConfig] = useState<NotificationsConfig | null>(null);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[] | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);

    const [classInfoClass, setClassInfoClass] = useState<SitClass | null>(null);

    const [currentSchedule, setCurrentSchedule] = useState<SitSchedule>(initialCachedSchedules[0]!);

    const classes = useMemo(() => currentSchedule.days.flatMap((d) => d.classes) ?? [], [currentSchedule.days]);

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

    return (
        <>
            <PageHead title={`${acronym}-rezervo`} />
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <AppBar
                        leftComponent={<Logo integrationAcronym={acronym} />}
                        rightComponent={
                            <ConfigBar
                                classes={classes}
                                selectedClassIds={selectedClassIds}
                                originalSelectedClassIds={originalSelectedClassIds}
                                userConfig={userConfig}
                                userConfigActive={userConfigActive}
                                notificationsConfig={notificationsConfig}
                                isLoadingConfig={userConfig == null || userConfigLoading}
                                isConfigError={userConfigError}
                                onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                            />
                        }
                    />
                    <WeekNavigator
                        initialCachedSchedules={initialCachedSchedules}
                        setCurrentSchedule={setCurrentSchedule}
                    />
                    <Divider orientation="horizontal" />
                </Box>
                <WeekScheduleMemo
                    currentSchedule={currentSchedule}
                    classPopularityIndex={classPopularityIndex}
                    selectable={userConfig != undefined && !userConfigLoading && !userConfigError}
                    selectedClassIds={selectedClassIds}
                    allConfigsIndex={allConfigsIndex ?? null}
                    onSelectedChanged={onSelectedChanged}
                    onInfo={setClassInfoClass}
                />
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
}
export default Integration;
