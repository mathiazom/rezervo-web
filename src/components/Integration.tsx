import { Box, Divider, Stack } from "@mui/material";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import ConfigBar from "@/components/configuration/ConfigBar";
import AgendaModal from "@/components/modals/Agenda/AgendaModal";
import ClassInfoModal from "@/components/modals/ClassInfo/ClassInfoModal";
import IntegrationUserSettingsModal from "@/components/modals/IntegrationUser/IntegrationUserSettingsModal";
import SettingsModal from "@/components/modals/Settings/SettingsModal";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import WeekSchedule from "@/components/schedule/WeekSchedule";
import AppBar from "@/components/utils/AppBar";
import ErrorMessage from "@/components/utils/ErrorMessage";
import IntegrationSwitcher from "@/components/utils/IntegrationSwitcher";
import PageHead from "@/components/utils/PageHead";
import { classConfigRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { RezervoError } from "@/types/errors";
import { IntegrationProfile, RezervoClass, RezervoSchedule, RezervoWeekSchedule } from "@/types/integration";
import { ClassPopularityIndex } from "@/types/popularity";

// Memoize to avoid redundant schedule re-render on class selection change
const WeekScheduleMemo = memo(WeekSchedule);

function Integration({
    initialSchedule,
    classPopularityIndex,
    integrationProfile,
    error,
}: {
    initialSchedule: RezervoSchedule;
    classPopularityIndex: ClassPopularityIndex;
    integrationProfile: IntegrationProfile;
    error: RezervoError | undefined;
}) {
    const { userConfig, userConfigError, userConfigLoading, allConfigsIndex } = useUserConfig(
        integrationProfile.identifier,
    );

    const [userConfigActive, setUserConfigActive] = useState(true);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[] | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isIntegrationUserSettingsOpen, setIsIntegrationUserSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);

    const [classInfoClass, setClassInfoClass] = useState<RezervoClass | null>(null);

    const [currentWeekSchedule, setCurrentWeekSchedule] = useState<RezervoWeekSchedule>(initialSchedule[0]!);

    const classes = useMemo(
        () => currentWeekSchedule.flatMap((daySchedule) => daySchedule.classes) ?? [],
        [currentWeekSchedule],
    );

    const onSelectedChanged = useCallback((classId: string, selected: boolean) => {
        setSelectedClassIds((s) =>
            s == null ? s : selected ? (s.includes(classId) ? s : [...s, classId]) : s.filter((c) => c != classId),
        );
    }, []);

    const scrollToTodayRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const classIds = userConfig?.classes?.map(classConfigRecurrentId) ?? null;
        setSelectedClassIds(classIds);
        setOriginalSelectedClassIds(classIds);
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig]);

    useEffect(() => {
        setCurrentWeekSchedule(initialSchedule[0]!);
    }, [initialSchedule]);

    useEffect(() => {
        scrollToToday();
    }, [scrollToTodayRef]);

    function scrollToToday() {
        const target = scrollToTodayRef.current;
        if (target != null) {
            target.scrollIntoView({
                behavior: "smooth",
                inline: "start",
            });
        }
    }

    return (
        <>
            <PageHead title={`${integrationProfile.identifier}-rezervo`} />
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <AppBar
                        leftComponent={<IntegrationSwitcher currentIntegrationProfile={integrationProfile} />}
                        rightComponent={
                            <ConfigBar
                                integration={integrationProfile.identifier}
                                classes={classes}
                                selectedClassIds={selectedClassIds}
                                originalSelectedClassIds={originalSelectedClassIds}
                                userConfig={userConfig}
                                userConfigActive={userConfigActive}
                                isLoadingConfig={userConfig == null || userConfigLoading}
                                isConfigError={userConfigError}
                                onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onIntegrationUserSettingsOpen={() => setIsIntegrationUserSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                            />
                        }
                    />
                    {error === undefined && (
                        <WeekNavigator
                            integration={integrationProfile.identifier}
                            initialSchedule={initialSchedule}
                            setCurrentWeekSchedule={setCurrentWeekSchedule}
                            onGoToToday={scrollToToday}
                        />
                    )}
                    <Divider orientation="horizontal" />
                </Box>
                {error === undefined ? (
                    <WeekScheduleMemo
                        integration={integrationProfile.identifier}
                        weekSchedule={currentWeekSchedule}
                        classPopularityIndex={classPopularityIndex}
                        selectable={userConfig != undefined && !userConfigLoading && !userConfigError}
                        selectedClassIds={selectedClassIds}
                        allConfigsIndex={allConfigsIndex ?? null}
                        onSelectedChanged={onSelectedChanged}
                        onInfo={setClassInfoClass}
                        todayRef={scrollToTodayRef}
                    />
                ) : (
                    <ErrorMessage error={error} integrationProfile={integrationProfile} />
                )}
            </Stack>
            <ClassInfoModal
                integration={integrationProfile.identifier}
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
                integrationProfile={integrationProfile}
                bookingActive={userConfigActive}
                setBookingActive={setUserConfigActive}
                openIntegrationUserSettings={() => setIsIntegrationUserSettingsOpen(true)}
            />
            <IntegrationUserSettingsModal
                open={isIntegrationUserSettingsOpen}
                setOpen={setIsIntegrationUserSettingsOpen}
                integration={integrationProfile.identifier}
                onSubmit={() => setIsIntegrationUserSettingsOpen(false)}
            />
        </>
    );
}

export default Integration;
