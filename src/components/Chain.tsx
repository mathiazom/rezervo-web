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
import { getStoredSelectedCategories, getStoredSelectedLocations } from "@/lib/helpers/storage";
import { useSchedule } from "@/lib/hooks/useSchedule";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { buildConfigMapFromClasses } from "@/lib/utils/configUtils";
import { ChainProfile, RezervoChain, RezervoClass, RezervoWeekSchedule } from "@/types/chain";
import { ClassConfig } from "@/types/config";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";

// Memoize to avoid redundant schedule re-render on class selection change
const WeekScheduleMemo = memo(WeekSchedule);

function Chain({
    classPopularityIndex,
    chain,
    chainProfiles,
    initialLocationIds,
    activityCategories,
    error,
}: {
    classPopularityIndex: ClassPopularityIndex;
    chain: RezervoChain;
    chainProfiles: ChainProfile[];
    initialLocationIds: string[];
    activityCategories: string[];
    error: RezervoError | undefined;
}) {
    const { userConfig, userConfigError, userConfigLoading, putUserConfig } = useUserConfig(chain.profile.identifier);
    const { userSessionsIndex } = useUserSessions(chain.profile.identifier);

    const [userConfigActive, setUserConfigActive] = useState(true);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isChainUserSettingsOpen, setIsChainUserSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const [bookingPopupClass, setBookingPopupClass] = useState<RezervoClass | null>(null);
    const [bookingPopupAction, setBookingPopupAction] = useState<"book" | "cancel" | null>(null);

    const [classInfoClass, setClassInfoClass] = useState<RezervoClass | null>(null);

    const [weekOffset, setWeekOffset] = useState(0);

    const defaultLocationIds = useMemo(() => {
        return chain.branches.length > 0 ? chain.branches[0]!.locations.map(({ identifier }) => identifier) : [];
    }, [chain.branches]);

    const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(initialLocationIds);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(activityCategories);
    const [selectedChain, setSelectedChain] = useState<string | null>(null);

    useEffect(() => {
        const locationIds = getStoredSelectedLocations(chain.profile.identifier) ?? defaultLocationIds;
        setSelectedLocationIds(locationIds);
        setSelectedCategories(getStoredSelectedCategories(chain.profile.identifier) ?? activityCategories);
        setSelectedChain(chain.profile.identifier);
    }, [chain.profile.identifier, defaultLocationIds, activityCategories]);

    const {
        latestLoadedWeekOffset,
        weekSchedule: currentWeekSchedule,
        weekScheduleLoading,
    } = useSchedule(selectedChain, weekOffset, selectedLocationIds);

    const classes = useMemo(
        () => currentWeekSchedule?.days.flatMap((daySchedule) => daySchedule.classes) ?? [],
        [currentWeekSchedule?.days],
    );

    // Pre-generate all non-ghost class config strings
    const classesConfigMap = useMemo(() => buildConfigMapFromClasses(classes), [classes]);

    // Combine all class config strings
    const allClassesConfigMap = useMemo(() => {
        // Locate any class configs from the user config that do not exist in the current schedule
        const ghostClassesConfigs =
            userConfig?.recurringBookings
                ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
                .reduce<{ [id: string]: ClassConfig }>(
                    (o, c) => ({
                        ...o,
                        [classConfigRecurrentId(c)]: c,
                    }),
                    {},
                ) ?? {};
        return { ...classesConfigMap, ...ghostClassesConfigs };
    }, [classesConfigMap, userConfig?.recurringBookings]);

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
            recurringBookings: newSelectedClassIds?.flatMap((id) => allClassesConfigMap[id] ?? []) ?? [],
        });
    };

    const scrollToTodayRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setSelectedClassIds(userConfig?.recurringBookings?.map(classConfigRecurrentId) ?? null);
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig?.active, userConfig?.recurringBookings]);

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

    const isLoadingPreviousWeek =
        weekScheduleLoading && latestLoadedWeekOffset != null && latestLoadedWeekOffset > weekOffset;
    const isLoadingNextWeek =
        weekScheduleLoading && latestLoadedWeekOffset != null && latestLoadedWeekOffset < weekOffset;

    return (
        <>
            <PageHead title={`${chain.profile.identifier}-rezervo`} />
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <AppBar
                        leftComponent={
                            <ChainSwitcher currentChainProfile={chain.profile} chainProfiles={chainProfiles} />
                        }
                        rightComponent={
                            <ConfigBar
                                chain={chain.profile.identifier}
                                userConfig={userConfig}
                                isLoadingConfig={userConfig == null || userConfigLoading}
                                isConfigError={userConfigError}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onChainUserSettingsOpen={() => setIsChainUserSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                            />
                        }
                    />
                    {error === undefined && currentWeekSchedule != null && (
                        <WeekNavigator
                            chain={chain}
                            setCurrentWeekOffset={setWeekOffset}
                            isLoadingPreviousWeek={isLoadingPreviousWeek}
                            isLoadingNextWeek={isLoadingNextWeek}
                            weekNumber={getWeekNumber(currentWeekSchedule)}
                            onGoToToday={scrollToToday}
                            selectedLocationIds={selectedLocationIds}
                            setSelectedLocationIds={setSelectedLocationIds}
                            allCategories={activityCategories}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                        />
                    )}
                    <Divider orientation="horizontal" />
                </Box>
                {error === undefined ? (
                    currentWeekSchedule != null && (
                        <WeekScheduleMemo
                            chain={chain.profile.identifier}
                            weekSchedule={currentWeekSchedule}
                            selectedLocationIds={selectedLocationIds}
                            selectedCategories={selectedCategories}
                            classPopularityIndex={classPopularityIndex}
                            selectable={userConfig != undefined && !userConfigError}
                            selectedClassIds={selectedClassIds}
                            onUpdateConfig={onUpdateConfig}
                            onInfo={setClassInfoClass}
                            todayRef={scrollToTodayRef}
                        />
                    )
                ) : (
                    <ErrorMessage error={error} chainProfile={chain.profile} />
                )}
            </Stack>
            <ClassInfoModal
                chain={chain.profile.identifier}
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
                chainProfile={chain.profile}
                bookingActive={userConfigActive}
                setBookingActive={setUserConfigActive}
                openChainUserSettings={() => setIsChainUserSettingsOpen(true)}
            />
            <ChainUserSettingsModal
                open={isChainUserSettingsOpen}
                setOpen={setIsChainUserSettingsOpen}
                chainProfile={chain.profile}
                onSubmit={() => setIsChainUserSettingsOpen(false)}
            />
            <BookingPopupModal
                onClose={() => setBookingPopupAction(null)}
                chain={chain.profile.identifier}
                _class={bookingPopupClass}
                action={bookingPopupAction}
            />
        </>
    );
}

export default Chain;

function getWeekNumber(weekSchedule: RezervoWeekSchedule): number {
    const firstDay = weekSchedule.days[0];
    if (firstDay === undefined) {
        throw new Error("Week schedule is empty (missing first day)");
    }
    return firstDay.date.weekNumber;
}
