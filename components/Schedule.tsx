import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { ClassPopularityIndex, AllConfigsIndex } from "../types/rezervoTypes";
import WeekNavigator from "./WeekNavigator";
import { useRouter } from "next/router";
import DaySchedule from "./DaySchedule";

const Schedule = ({
    initialCachedSchedules,
    currentSchedule,
    setCurrentSchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    onSelectedChanged,
    onInfo,
}: {
    initialCachedSchedules: { [weekOffset: number]: SitSchedule };
    currentSchedule: SitSchedule;
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

    useEffect(() => {
        const { classId, ...queryWithoutParam } = router.query;
        if (classId === undefined) {
            return;
        }
        const linkedClass = currentSchedule.days
            .flatMap((day) => day.classes)
            .find((_class) => _class.id === Number(classId));
        if (linkedClass) {
            onInfo(linkedClass);
        }
        router.replace({ query: queryWithoutParam });
    }, [onInfo, router, currentSchedule.days]);

    return (
        <>
            <WeekNavigator initialCachedSchedules={initialCachedSchedules} setCurrentSchedule={setCurrentSchedule} />
            <Divider orientation="horizontal" />
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                <Stack direction={"column"}>
                    <Stack direction={"row"} margin={"auto"} spacing={2} px={1}>
                        {currentSchedule.days.map((day) => (
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
