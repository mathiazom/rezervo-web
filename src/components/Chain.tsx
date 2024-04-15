import { Box, Divider, Stack } from "@mui/material";
import React, { memo, useEffect, useMemo, useState } from "react";

import ConfigBar from "@/components/configuration/ConfigBar";
import AgendaModal from "@/components/modals/Agenda/AgendaModal";
import BookingPopupModal from "@/components/modals/BookingPopupModal";
import ClassInfoModal from "@/components/modals/ClassInfo/ClassInfoModal";
import CommunityModal from "@/components/modals/Community/CommunityModal";
import ProfileModal from "@/components/modals/Profile/ProfileModal";
import SettingsModal from "@/components/modals/Settings/SettingsModal";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import WeekSchedule from "@/components/schedule/WeekSchedule";
import AppBar from "@/components/utils/AppBar";
import ChainSwitcher from "@/components/utils/ChainSwitcher";
import ClassLinkingProvider from "@/components/utils/ClassLinkingProvider";
import ErrorMessage from "@/components/utils/ErrorMessage";
import PageHead from "@/components/utils/PageHead";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { getStoredSelectedCategories, getStoredSelectedLocations } from "@/lib/helpers/storage";
import { useSchedule } from "@/lib/hooks/useSchedule";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { buildConfigMapFromClasses } from "@/lib/utils/configUtils";
import {
    ActivityCategory,
    BookingPopupAction,
    BookingPopupState,
    ChainProfile,
    RezervoChain,
    RezervoClass,
    RezervoWeekSchedule,
} from "@/types/chain";
import { ClassConfig } from "@/types/config";
import { RezervoError } from "@/types/errors";
import { ClassPopularityIndex } from "@/types/popularity";
import { SessionStatus } from "@/types/userSessions";

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
    activityCategories: ActivityCategory[];
    error: RezervoError | undefined;
}) {
    const { userConfig, userConfigError, userConfigLoading, putUserConfig, mutateUserConfig } = useUserConfig(
        chain.profile.identifier,
    );
    const { userSessionsIndex } = useUserSessionsIndex(chain.profile.identifier);
    const { userSessions } = useUserSessions();
    const { userChainConfigs } = useUserChainConfigs();

    const [userConfigActive, setUserConfigActive] = useState(true);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);

    const [isCommunityOpen, setIsCommunityOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAgendaOpen, setIsAgendaOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [bookingPopupState, setBookingPopupState] = useState<BookingPopupState | null>(null);

    const [classInfoClass, setClassInfoClass] = useState<RezervoClass | null>(null);

    const [weekOffset, setWeekOffset] = useState(0);

    const defaultLocationIds = useMemo(() => {
        return chain.branches.length > 0 ? chain.branches[0]!.locations.map(({ identifier }) => identifier) : [];
    }, [chain.branches]);

    const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(initialLocationIds);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(activityCategories.map((ac) => ac.name));
    const [selectedChain, setSelectedChain] = useState<string | null>(null);

    useEffect(() => {
        const locationIds = getStoredSelectedLocations(chain.profile.identifier) ?? defaultLocationIds;
        setSelectedLocationIds(locationIds);
        setSelectedCategories(
            getStoredSelectedCategories(chain.profile.identifier) ?? activityCategories.map((ac) => ac.name),
        );
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

    const onUpdateConfig = async (classId: string, selected: boolean) => {
        const selectedClass = classes.find((c) => classRecurrentId(c) === classId);
        if (selectedClass?.isBookable) {
            const isBooked =
                userSessionsIndex?.[selectedClass.id]?.some(
                    (userSession) => userSession.isSelf && userSession.status === SessionStatus.BOOKED,
                ) ?? false;
            if (selected && !isBooked) {
                setBookingPopupState({
                    chain: chain.profile.identifier,
                    _class: selectedClass,
                    action: BookingPopupAction.BOOK,
                });
            } else if (!selected && isBooked) {
                setBookingPopupState({
                    chain: chain.profile.identifier,
                    _class: selectedClass,
                    action: BookingPopupAction.CANCEL,
                });
            }
        }
        const s = selectedClassIds;
        const newSelectedClassIds =
            s == null ? s : selected ? (s.includes(classId) ? s : [...s, classId]) : s.filter((c) => c != classId);
        setSelectedClassIds(newSelectedClassIds);
        return await putUserConfig({
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
                block: "center",
                inline: "center",
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
            <ClassLinkingProvider
                classes={classes}
                setWeekOffset={setWeekOffset}
                setClassInfoClass={setClassInfoClass}
            />
            <Stack sx={{ height: "100%", overflow: "hidden" }}>
                <Box sx={{ flexShrink: 0 }}>
                    <AppBar
                        leftComponent={
                            <ChainSwitcher currentChainProfile={chain.profile} chainProfiles={chainProfiles} />
                        }
                        rightComponent={
                            <ConfigBar
                                chainConfigs={userChainConfigs}
                                userSessions={userSessions}
                                isLoadingConfig={userConfigLoading}
                                isConfigError={userConfigError}
                                onRefetchConfig={async () => {
                                    await mutateUserConfig();
                                }}
                                onCommunityOpen={() => setIsCommunityOpen(true)}
                                onSettingsOpen={() => setIsSettingsOpen(true)}
                                onAgendaOpen={() => setIsAgendaOpen(true)}
                                onProfileOpen={() => setIsProfileOpen(true)}
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
                            scrollToTodayRef={scrollToTodayRef}
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
            <CommunityModal open={isCommunityOpen} setOpen={setIsCommunityOpen} chainProfiles={chainProfiles} />
            {userSessions !== null && userChainConfigs !== null && (
                <AgendaModal
                    userSession={userSessions}
                    chainConfigs={userChainConfigs}
                    chainProfiles={chainProfiles}
                    open={isAgendaOpen}
                    setOpen={setIsAgendaOpen}
                />
            )}
            {userChainConfigs !== null && (
                <SettingsModal
                    open={isSettingsOpen}
                    setOpen={setIsSettingsOpen}
                    chainProfiles={chainProfiles}
                    chainConfigs={userChainConfigs}
                />
            )}
            <ProfileModal open={isProfileOpen} setOpen={setIsProfileOpen} />
            {bookingPopupState && (
                <BookingPopupModal
                    onClose={() => setBookingPopupState(null)}
                    chain={bookingPopupState.chain}
                    _class={bookingPopupState._class}
                    action={bookingPopupState.action}
                />
            )}
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
