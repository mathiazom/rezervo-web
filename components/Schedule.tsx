import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Chip, Divider, Stack, Typography, useTheme } from "@mui/material";
import ClassCard from "./ClassCard/ClassCard";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { sitClassRecurrentId } from "../lib/iBooking";
import { DateTime } from "luxon";
import { SIT_TIMEZONE } from "../config/config";
import { ClassPopularity, ClassPopularityIndex, AllConfigsIndex } from "../types/rezervoTypes";
import WeekNavigator from "./WeekNavigator";
import { useRouter } from "next/router";

const Schedule = ({
    initialCachedSchedules,
    schedule,
    setCurrentSchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    onSelectedChanged,
    onInfo,
}: {
    initialCachedSchedules: { [weekOffset: number]: SitSchedule };
    schedule: SitSchedule;
    setCurrentSchedule: Dispatch<SetStateAction<SitSchedule>>;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    allConfigsIndex: AllConfigsIndex | null;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (classId: string, selected: boolean) => void;
    // eslint-disable-next-line no-unused-vars
    onInfo: (c: SitClass) => void;
}) => {
    const router = useRouter();
    const theme = useTheme();

    const [cachedSchedules, setCachedSchedules] = useState<{ [weekOffset: number]: SitSchedule }>(
        initialCachedSchedules
    );
    const [weekOffset, setWeekOffset] = useState(0);
    const [loadingNextWeek, setLoadingNextWeek] = useState(false);
    const [loadingPreviousWeek, setLoadingPreviousWeek] = useState(false);

    useEffect(() => {
        const { classId, ...queryWithoutParam } = router.query;
        if (classId === undefined) {
            return;
        }
        const linkedClass = schedule.days.flatMap((day) => day.classes).find((_class) => _class.id === Number(classId));
        if (linkedClass) {
            onInfo(linkedClass);
        }
        router.replace({ query: queryWithoutParam });
    }, [onInfo, router, schedule.days]);

    function sameDay(a: DateTime, b: DateTime): boolean {
        return a.startOf("day") <= b && b <= a.endOf("day");
    }

    function isToday(dateStr: string) {
        return sameDay(DateTime.fromISO(dateStr, { zone: SIT_TIMEZONE }), DateTime.now());
    }

    function isDayPassed(dateStr: string) {
        return DateTime.fromISO(dateStr, { zone: SIT_TIMEZONE }).endOf("day") > DateTime.now();
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

    return (
        <>
            <WeekNavigator
                weekNumber={DateTime.fromISO(schedule.days[0]!.date).weekNumber}
                weekOffset={weekOffset}
                loadingPreviousWeek={loadingPreviousWeek}
                loadingNextWeek={loadingNextWeek}
                onUpdateWeekOffset={handleUpdateWeekOffset}
            />
            <Divider orientation="horizontal" />
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <Stack direction={"column"}>
                    <Stack direction={"row"} margin={"auto"} spacing={2} px={1}>
                        {schedule.days.map((day) => (
                            <Box key={day.date} width={180}>
                                <Box py={2} sx={{ opacity: isDayPassed(day.date) ? 1 : 0.5 }}>
                                    <Typography variant="h6" component="div">
                                        {day.dayName}{" "}
                                        {isToday(day.date) && (
                                            <Chip
                                                size={"small"}
                                                sx={{ backgroundColor: theme.palette.primary.dark, color: "#fff" }}
                                                label="I dag"
                                            />
                                        )}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        style={{
                                            color: theme.palette.grey[600],
                                            fontSize: 15,
                                        }}
                                    >
                                        {day.date}
                                    </Typography>
                                </Box>
                                {day.classes.length > 0 ? (
                                    day.classes.map((_class) => (
                                        <Box key={_class.id} mb={1}>
                                            <ClassCard
                                                _class={_class}
                                                popularity={
                                                    classPopularityIndex[sitClassRecurrentId(_class)] ??
                                                    ClassPopularity.Unknown
                                                }
                                                configUsers={
                                                    allConfigsIndex
                                                        ? allConfigsIndex[sitClassRecurrentId(_class)] ?? []
                                                        : []
                                                }
                                                selectable={selectable}
                                                selected={
                                                    selectedClassIds != null &&
                                                    selectedClassIds.includes(sitClassRecurrentId(_class))
                                                }
                                                onSelectedChanged={(s) =>
                                                    onSelectedChanged(sitClassRecurrentId(_class), s)
                                                }
                                                onInfo={() => onInfo(_class)}
                                                // onSettings={() =>
                                                //     setSettingsClass(_class)
                                                // }
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <p>Ingen gruppetimer</p>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};

export default Schedule;
