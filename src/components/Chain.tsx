"use client";

import { Box, Divider, Stack } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import ConfigBar from "@/components/configuration/ConfigBar";
import AgendaModal from "@/components/modals/Agenda/AgendaModal";
import BookingPopupModal from "@/components/modals/BookingPopupModal";
import ClassInfoModal from "@/components/modals/ClassInfo/ClassInfoModal";
import CommunityModal from "@/components/modals/Community/CommunityModal";
import ProfileModal from "@/components/modals/Profile/ProfileModal";
import SettingsModal from "@/components/modals/Settings/SettingsModal";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import WeekSchedule from "@/components/schedule/WeekSchedule";
import WeekScheduleSkeleton from "@/components/schedule/WeekScheduleSkeleton";
import AppBar from "@/components/utils/AppBar";
import ChainSwitcher from "@/components/utils/ChainSwitcher";
import CheckIn from "@/components/utils/CheckIn";
import ErrorMessage from "@/components/utils/ErrorMessage";
import PWAInstallPrompt from "@/components/utils/PWAInstallPrompt";
import { ISO_WEEK_QUERY_PARAM } from "@/lib/consts";
import { getAllLocationIds, getDefaultLocationIds } from "@/lib/helpers/chain";
import { compactISOWeekString, fromCompactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import {
    getStoredExcludeClassTimeFilters,
    getStoredSelectedCategories,
    getStoredSelectedLocations,
} from "@/lib/helpers/storage";
import { useClassInfo } from "@/lib/hooks/useClassInfo";
import { usePrefetchAdjacentWeeks, useScheduleWeek } from "@/lib/hooks/useSchedule";
import { useUserChainConfigs } from "@/lib/hooks/useUserChainConfigs";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { updateValueSelection } from "@/lib/utils/arrayUtils";
import { buildAllClassesConfigMap } from "@/lib/utils/configUtils";
import {
    ActivityCategory,
    BookingPopupAction,
    BookingPopupState,
    ChainProfile,
    ExcludeClassTimeFiltersType,
    RezervoChain,
    RezervoWeekSchedule,
} from "@/types/chain";
import { RezervoError } from "@/types/errors";
import { SessionStatus } from "@/types/userSessions";

function Chain({
    weekParam,
    showClassId,
    chain,
    chainProfiles,
    initialLocationIds,
    activityCategories,
}: {
    weekParam: string;
    showClassId: string | undefined;
    chain: RezervoChain;
    chainProfiles: ChainProfile[];
    initialLocationIds: string[];
    activityCategories: ActivityCategory[];
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { userConfig, userConfigError, userConfigLoading, putUserConfig, mutateUserConfig } = useUserConfig(
        chain.profile.identifier,
    );
    const { userSessionsIndex } = useUserSessionsIndex(chain.profile.identifier);
    const { userSessions } = useUserSessions();
    const { userChainConfigs } = useUserChainConfigs();

    const [userConfigActive, setUserConfigActive] = useState(true);

    const [currentWeek, setCurrentWeek] = useState(weekParam);

    const [selectedClassIds, setSelectedClassIds] = useState<string[] | null>(null);
    const deferredSelectedClassIds = useDeferredValue(selectedClassIds);

    const [activeModal, setActiveModal] = useState<"community" | "settings" | "agenda" | "profile" | null>(null);
    const closeModal = () => setActiveModal(null);
    const [bookingPopupState, setBookingPopupState] = useState<BookingPopupState | null>(null);

    // Memoized (despite React Compiler) because these feed useEffect dependency arrays — directly
    // (defaultLocationIds) and via the schedule hooks' internal effects (allLocationIds). Manual
    // memoization keeps a stable reference so those effects don't re-run on every render.
    const allLocationIds = useMemo(() => getAllLocationIds(chain), [chain]);

    const defaultLocationIds = useMemo(() => getDefaultLocationIds(chain), [chain]);

    const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(initialLocationIds);
    const deferredSelectedLocationIds = useDeferredValue(selectedLocationIds);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(activityCategories.map((ac) => ac.name));
    const deferredSelectedCategories = useDeferredValue(selectedCategories);
    const [excludeClassTimeFilters, setExcludeClassTimeFilters] = useState<ExcludeClassTimeFiltersType>({
        enabled: true,
        filters: [],
    });

    useEffect(() => {
        const locationIds = getStoredSelectedLocations(chain.profile.identifier) ?? defaultLocationIds;
        setSelectedLocationIds(locationIds);
        setSelectedCategories(
            getStoredSelectedCategories(chain.profile.identifier) ?? activityCategories.map((ac) => ac.name),
        );
        setExcludeClassTimeFilters(getStoredExcludeClassTimeFilters() ?? { enabled: true, filters: [] });
    }, [chain.profile.identifier, defaultLocationIds, activityCategories]);

    const {
        weekSchedule: currentWeekSchedule,
        weekScheduleError,
        isLoadingInitial,
        isLoadingPreviousWeek,
        isLoadingNextWeek,
    } = useScheduleWeek(chain.profile.identifier, currentWeek, allLocationIds);

    usePrefetchAdjacentWeeks(chain.profile.identifier, currentWeek, allLocationIds, currentWeekSchedule != null);

    // Memoized because it is a useEffect dependency below (stable reference avoids re-running the effect each render).
    const classes = useMemo(
        () => currentWeekSchedule?.days.flatMap((daySchedule) => daySchedule.classes) ?? [],
        [currentWeekSchedule?.days],
    );

    const { classInfoClass, setClassInfoClass } = useClassInfo(showClassId, classes);

    const allClassesConfigMap = buildAllClassesConfigMap(classes, userConfig?.recurringBookings);

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
        if (deferredSelectedClassIds == null) return;
        const newSelectedClassIds = updateValueSelection(deferredSelectedClassIds, classId, selected);
        setSelectedClassIds(newSelectedClassIds);
        return await putUserConfig({
            active: userConfigActive,
            recurringBookings: newSelectedClassIds?.flatMap((id) => allClassesConfigMap[id] ?? []) ?? [],
        });
    };

    const scrollToTodayRef = useRef<HTMLDivElement | null>(null);

    // Memoized because it is a useEffect dependency below.
    const scrollToToday = useCallback(() => {
        scrollToTodayRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }, []);

    const [scrollPending, setScrollPending] = useState(true);
    useEffect(() => {
        // stay pending until the today column has actually rendered (it may be absent during a placeholder week)
        if (!scrollPending || currentWeekSchedule == null || scrollToTodayRef.current == null) return;
        const handle = requestAnimationFrame(() => scrollToToday());
        setScrollPending(false);
        return () => cancelAnimationFrame(handle);
    }, [scrollPending, currentWeekSchedule, scrollToToday]);

    useEffect(() => {
        setSelectedClassIds(userConfig?.recurringBookings?.map(classConfigRecurrentId) ?? null);
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig?.active, userConfig?.recurringBookings]);

    const syncWeekUrl = (week: string) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(ISO_WEEK_QUERY_PARAM, week);
        window.history.replaceState(null, "", `${pathname}?${newSearchParams.toString()}`);
    };

    const goToWeek = (week: string) => {
        setCurrentWeek(week);
        syncWeekUrl(week);
    };

    const goToToday = () => {
        const today = compactISOWeekString(LocalizedDateTime.now());
        if (today != null) {
            setCurrentWeek(today);
            syncWeekUrl(today);
        }
        setScrollPending(true);
    };

    let weekNumber: number;
    if (currentWeekSchedule != null) {
        weekNumber = getWeekNumber(currentWeekSchedule);
    } else {
        const date = fromCompactISOWeekString(currentWeek);
        weekNumber = date.isValid ? date.weekNumber : LocalizedDateTime.now().weekNumber;
    }

    const [showPWAInstall, setShowPWAInstall] = useState(false);
    const [isPWAInstalled, setIsPWAInstalled] = useState(false);

    return (
        <>
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
                                isConfigError={userConfigError != null}
                                onRefetchConfig={mutateUserConfig}
                                onCommunityOpen={() => setActiveModal("community")}
                                onSettingsOpen={() => setActiveModal("settings")}
                                onAgendaOpen={() => setActiveModal("agenda")}
                                onProfileOpen={() => setActiveModal("profile")}
                            />
                        }
                    />
                    {weekScheduleError == null && (
                        <WeekNavigator
                            chain={chain}
                            weekParam={currentWeek}
                            isLoadingPreviousWeek={isLoadingPreviousWeek}
                            isLoadingNextWeek={isLoadingNextWeek}
                            weekNumber={weekNumber}
                            onChangeWeek={goToWeek}
                            onToday={goToToday}
                            selectedLocationIds={selectedLocationIds}
                            setSelectedLocationIds={setSelectedLocationIds}
                            allCategories={activityCategories}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                            excludeClassTimeFilters={excludeClassTimeFilters}
                            setExcludeClassTimeFilters={setExcludeClassTimeFilters}
                        />
                    )}
                    <Divider orientation="horizontal" />
                </Box>
                {weekScheduleError != null ? (
                    <ErrorMessage error={RezervoError.CHAIN_SCHEDULE_UNAVAILABLE} chainProfile={chain.profile} />
                ) : currentWeekSchedule != null ? (
                    <WeekSchedule
                        chain={chain.profile.identifier}
                        weekSchedule={currentWeekSchedule}
                        selectedLocationIds={deferredSelectedLocationIds}
                        selectedCategories={deferredSelectedCategories}
                        excludeClassTimeFilters={excludeClassTimeFilters}
                        selectable={userConfig != undefined && !userConfigError}
                        selectedClassIds={selectedClassIds}
                        onUpdateConfig={onUpdateConfig}
                        setClassInfoClass={setClassInfoClass}
                        scrollToTodayRef={scrollToTodayRef}
                    />
                ) : (
                    isLoadingInitial && <WeekScheduleSkeleton weekParam={currentWeek} />
                )}
            </Stack>
            <CheckIn chain={chain} selectedLocationIds={deferredSelectedLocationIds} />
            <ClassInfoModal
                chain={chain.profile.identifier}
                classInfoClass={classInfoClass}
                onUpdateConfig={onUpdateConfig}
                onClose={() => setClassInfoClass(null)}
            />
            <CommunityModal open={activeModal === "community"} onClose={closeModal} chainProfiles={chainProfiles} />
            {userSessions !== null && userChainConfigs !== null && (
                <AgendaModal
                    userSessions={userSessions}
                    chainConfigs={userChainConfigs}
                    chainProfiles={chainProfiles}
                    open={activeModal === "agenda"}
                    onClose={closeModal}
                />
            )}
            {userChainConfigs !== null && (
                <SettingsModal
                    open={activeModal === "settings"}
                    onClose={closeModal}
                    chainProfiles={chainProfiles}
                    chainConfigs={userChainConfigs}
                    isPWAInstalled={isPWAInstalled}
                    showPWAInstall={() => setShowPWAInstall(true)}
                />
            )}
            <ProfileModal open={activeModal === "profile"} onClose={closeModal} />
            {bookingPopupState && (
                <BookingPopupModal
                    onClose={() => setBookingPopupState(null)}
                    chain={bookingPopupState.chain}
                    _class={bookingPopupState._class}
                    action={bookingPopupState.action}
                />
            )}
            <PWAInstallPrompt
                show={showPWAInstall}
                onClose={() => setShowPWAInstall(false)}
                onIsInstalledChanged={(isInstalled: boolean) => setIsPWAInstalled(isInstalled)}
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
