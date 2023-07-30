import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { DateTime } from "luxon";
import { ClassPopularityIndex, AllConfigsIndex } from "../types/rezervoTypes";
import WeekNavigator from "./WeekNavigator";
import { useRouter } from "next/router";
import DaySchedule from "./DaySchedule";

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
                            <DaySchedule
                                key={day.date}
                                day={day}
                                classPopularityIndex={classPopularityIndex}
                                selectable={selectable}
                                selectedClassIds={selectedClassIds}
                                allConfigsIndex={allConfigsIndex}
                                onSelectedChanged={onSelectedChanged}
                                onInfo={onInfo}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};

export default Schedule;
