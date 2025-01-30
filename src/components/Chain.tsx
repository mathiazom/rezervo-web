import { Box, Divider, Stack } from "@mui/material";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import CheckIn from "@/components/utils/CheckIn";
import ErrorMessage from "@/components/utils/ErrorMessage";
import PWAInstallPrompt from "@/components/utils/PWAInstallPrompt";
import { CLASS_ID_QUERY_PARAM, ISO_WEEK_QUERY_PARAM, SCROLL_TO_NOW_QUERY_PARAM } from "@/lib/consts";
import { compactISOWeekString, LocalizedDateTime } from "@/lib/helpers/date";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import {
    getStoredExcludeClassTimeFilters,
    getStoredSelectedCategories,
    getStoredSelectedLocations,
} from "@/lib/helpers/storage";
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
    ExcludeClassTimeFiltersType,
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

    const defaultLocationIds = useMemo(() => {
        const firstBranch = chain.branches[0];
        return firstBranch ? firstBranch.locations.map(({ identifier }) => identifier) : [];
    }, [chain.branches]);

    const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(initialLocationIds);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(activityCategories.map((ac) => ac.name));
    const [excludeClassTimeFilters, setExcludeClassTimeFilters] = useState<ExcludeClassTimeFiltersType>({
        enabled: true,
        filters: [],
    });
    const [selectedChain, setSelectedChain] = useState<string | null>(null);

    const [weekParam] = useQueryState(
        ISO_WEEK_QUERY_PARAM,
        parseAsString.withDefault(compactISOWeekString(LocalizedDateTime.now())),
    );

    const [classIdParam, setClassIdParam] = useQueryState(CLASS_ID_QUERY_PARAM);
    const [classInfoClass, setClassInfoClass] = useState<RezervoClass | null>(null);

    useEffect(() => {
        const locationIds = getStoredSelectedLocations(chain.profile.identifier) ?? defaultLocationIds;
        setSelectedLocationIds(locationIds);
        setSelectedCategories(
            getStoredSelectedCategories(chain.profile.identifier) ?? activityCategories.map((ac) => ac.name),
        );
        setExcludeClassTimeFilters(getStoredExcludeClassTimeFilters() ?? { enabled: true, filters: [] });
        setSelectedChain(chain.profile.identifier);
    }, [chain.profile.identifier, defaultLocationIds, activityCategories]);

    const {
        isLoadingPreviousWeek,
        isLoadingNextWeek,
        weekSchedule: currentWeekSchedule,
    } = useSchedule(selectedChain, weekParam, selectedLocationIds);

    const classes = useMemo(
        () => currentWeekSchedule?.days.flatMap((daySchedule) => daySchedule.classes) ?? [],
        [currentWeekSchedule?.days],
    );

    useEffect(() => {
        if (classIdParam === null) {
            setClassInfoClass(null);
            return;
        }
        const linkedClass = classes.find((_class) => _class.id === classIdParam);
        if (linkedClass !== undefined) {
            setClassInfoClass(linkedClass);
        }
    }, [classIdParam, classes, setClassInfoClass]);

    const onSetClassInfoClass = useCallback(
        (c: RezervoClass | null) => {
            setClassIdParam(c?.id ?? null);
            setClassInfoClass(c);
        },
        [setClassIdParam],
    );

    // Pre-generate all non-ghost class config strings
    const classesConfigMap = useMemo(() => buildConfigMapFromClasses(classes), [classes]);

    // Combine all class config strings
    const allClassesConfigMap = useMemo(() => {
        // Locate any class configs from the user config that do not exist in the current schedule
        const ghostClassesConfigs =
            userConfig?.recurringBookings
                ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
                .reduce<Record<string, ClassConfig>>(
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

    const scrollToTodayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setSelectedClassIds(userConfig?.recurringBookings?.map(classConfigRecurrentId) ?? null);
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig?.active, userConfig?.recurringBookings]);

    useEffect(() => {
        scrollToToday();
    }, [scrollToTodayRef]);

    const [scrollToNowParam, setScrollToNowParam] = useQueryState(SCROLL_TO_NOW_QUERY_PARAM, parseAsBoolean);

    useEffect(() => {
        if (scrollToNowParam) {
            scrollToToday();
            setTimeout(() => setScrollToNowParam(null), 3000);
        }
    }, [scrollToNowParam, setScrollToNowParam]);

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

    const refetchConfig = useCallback(async () => {
        await mutateUserConfig();
    }, [mutateUserConfig]);

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
                                isConfigError={userConfigError}
                                onRefetchConfig={refetchConfig}
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
                            isLoadingPreviousWeek={isLoadingPreviousWeek}
                            isLoadingNextWeek={isLoadingNextWeek}
                            weekNumber={getWeekNumber(currentWeekSchedule)}
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
                {error === undefined ? (
                    currentWeekSchedule != null && (
                        <WeekScheduleMemo
                            chain={chain.profile.identifier}
                            weekSchedule={currentWeekSchedule}
                            selectedLocationIds={selectedLocationIds}
                            selectedCategories={selectedCategories}
                            excludeClassTimeFilters={excludeClassTimeFilters}
                            classPopularityIndex={classPopularityIndex}
                            selectable={userConfig != undefined && !userConfigError}
                            selectedClassIds={selectedClassIds}
                            onUpdateConfig={onUpdateConfig}
                            onInfo={onSetClassInfoClass}
                            scrollToTodayRef={scrollToTodayRef}
                        />
                    )
                ) : (
                    <ErrorMessage error={error} chainProfile={chain.profile} />
                )}
            </Stack>
            <CheckIn chain={chain} selectedLocationIds={selectedLocationIds} />
            <ClassInfoModal
                chain={chain.profile.identifier}
                classInfoClass={classInfoClass}
                classPopularityIndex={classPopularityIndex}
                onUpdateConfig={onUpdateConfig}
                onClose={() => onSetClassInfoClass(null)}
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
                    isPWAInstalled={isPWAInstalled}
                    showPWAInstall={() => setShowPWAInstall(true)}
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
            <PWAInstallPrompt
                show={showPWAInstall}
                onClose={() => setShowPWAInstall(false)}
                onIsInstalledChanged={useCallback(
                    (isInstalled: boolean) => setIsPWAInstalled(isInstalled),
                    [setIsPWAInstalled],
                )}
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
