import { Box, Divider, Stack } from "@mui/material";
import React, { memo, useEffect, useMemo, useState } from "react";

import ConfigBar from "@/components/configuration/ConfigBar";
import AgendaModal from "@/components/modals/Agenda/AgendaModal";
import BookingPopupModal from "@/components/modals/BookingPopupModal";
import ChainUserSettingsModal from "@/components/modals/ChainUser/ChainUserSettingsModal";
import ClassInfoModal from "@/components/modals/ClassInfo/ClassInfoModal";
import SettingsModal from "@/components/modals/Settings/SettingsModal";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import WeekSchedule from "@/components/schedule/WeekSchedule";
import AppBar from "@/components/utils/AppBar";
import ChainSwitcher from "@/components/utils/ChainSwitcher";
import ErrorMessage from "@/components/utils/ErrorMessage";
import PageHead from "@/components/utils/PageHead";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { buildConfigMapFromClasses } from "@/lib/utils/configUtils";
import { ChainProfile, RezervoClass, RezervoSchedule, RezervoWeekSchedule } from "@/types/chain";
import { ClassConfig } from "@/types/config";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";

// Memoize to avoid redundant schedule re-render on class selection change
const WeekScheduleMemo = memo(WeekSchedule);

function Chain({
    initialSchedule,
    classPopularityIndex,
    chainProfile,
    error,
}: {
    initialSchedule: RezervoSchedule;
    classPopularityIndex: ClassPopularityIndex;
    chainProfile: ChainProfile;
    error: RezervoError | undefined;
}) {
    const { userConfig, userConfigError, userConfigLoading, putUserConfig } = useUserConfig(chainProfile.identifier);
    const { userSessionsIndex } = useUserSessions(chainProfile.identifier);

    const [userConfigActive, setUserConfigActive] = useState(true);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isChainUserSettingsOpen, setIsChainUserSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const [bookingPopupClass, setBookingPopupClass] = useState<RezervoClass | null>(null);
    const [bookingPopupAction, setBookingPopupAction] = useState<"book" | "cancel" | null>(null);

    const [classInfoClass, setClassInfoClass] = useState<RezervoClass | null>(null);

    const [currentWeekSchedule, setCurrentWeekSchedule] = useState<RezervoWeekSchedule>(initialSchedule[0]!);

    const classes = useMemo(
        () => currentWeekSchedule.flatMap((daySchedule) => daySchedule.classes) ?? [],
        [currentWeekSchedule],
    );

    // Pre-generate all non-ghost class config strings
    const classesConfigMap = useMemo(() => buildConfigMapFromClasses(classes), [classes]);

    // Combine all class config strings
    const allClassesConfigMap = useMemo(() => {
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
    }, [classesConfigMap, userConfig?.classes]);

    const onUpdateConfig = (classId: string, selected: boolean) => {
        const selectedClass = classes.find((c) => classRecurrentId(c) === classId);
        if (selectedClass?.isBookable) {
            setBookingPopupClass(selectedClass);
            const isBooked = userSessionsIndex?.[selectedClass.id] !== undefined;
            if (selected && !isBooked) {
                setBookingPopupAction("book");
            } else if (!selected && isBooked) {
                setBookingPopupAction("cancel");
            }
        }
        const s = selectedClassIds;
        const newSelectedClassIds =
            s == null ? s : selected ? (s.includes(classId) ? s : [...s, classId]) : s.filter((c) => c != classId);
        setSelectedClassIds(newSelectedClassIds);
        return putUserConfig({
            active: userConfigActive,
            classes: newSelectedClassIds?.flatMap((id) => allClassesConfigMap[id] ?? []) ?? [],
        });
    };

    const scrollToTodayRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setSelectedClassIds(userConfig?.classes?.map(classConfigRecurrentId) ?? null);
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig?.active, userConfig?.classes]);

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
            <PageHead title={`${chainProfile.identifier}-rezervo`} />
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <AppBar
                        leftComponent={<ChainSwitcher currentChainProfile={chainProfile} />}
                        rightComponent={
                            <ConfigBar
                                chain={chainProfile.identifier}
                                userConfig={userConfig}
                                isLoadingConfig={userConfig == null || userConfigLoading}
                                isConfigError={userConfigError}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onChainUserSettingsOpen={() => setIsChainUserSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                            />
                        }
                    />
                    {error === undefined && (
                        <WeekNavigator
                            chain={chainProfile.identifier}
                            initialSchedule={initialSchedule}
                            setCurrentWeekSchedule={setCurrentWeekSchedule}
                            onGoToToday={scrollToToday}
                        />
                    )}
                    <Divider orientation="horizontal" />
                </Box>
                {error === undefined ? (
                    <WeekScheduleMemo
                        chain={chainProfile.identifier}
                        weekSchedule={currentWeekSchedule}
                        classPopularityIndex={classPopularityIndex}
                        selectable={userConfig != undefined && !userConfigError}
                        selectedClassIds={selectedClassIds}
                        onUpdateConfig={onUpdateConfig}
                        onInfo={setClassInfoClass}
                        todayRef={scrollToTodayRef}
                    />
                ) : (
                    <ErrorMessage error={error} chainProfile={chainProfile} />
                )}
            </Stack>
            <ClassInfoModal
                chain={chainProfile.identifier}
                classInfoClass={classInfoClass}
                setClassInfoClass={setClassInfoClass}
                classPopularityIndex={classPopularityIndex}
                onUpdateConfig={onUpdateConfig}
            />
            <AgendaModal
                open={isAgendaOpen}
                setOpen={setIsAgendaOpen}
                userConfig={userConfig}
                classes={classes}
                onInfo={setClassInfoClass}
                onUpdateConfig={onUpdateConfig}
            />
            <SettingsModal
                open={isSettingsOpen}
                setOpen={setIsSettingsOpen}
                chainProfile={chainProfile}
                bookingActive={userConfigActive}
                setBookingActive={setUserConfigActive}
                openChainUserSettings={() => setIsChainUserSettingsOpen(true)}
            />
            <ChainUserSettingsModal
                open={isChainUserSettingsOpen}
                setOpen={setIsChainUserSettingsOpen}
                chainProfile={chainProfile}
                onSubmit={() => setIsChainUserSettingsOpen(false)}
            />
            <BookingPopupModal
                onClose={() => setBookingPopupAction(null)}
                chain={chainProfile.identifier}
                _class={bookingPopupClass}
                action={bookingPopupAction}
            />
        </>
    );
}

export default Chain;
