import { Box, Stack } from "@mui/material";
import DaySchedule from "./DaySchedule";
import React, { useEffect } from "react";
import { AllConfigsIndex, ClassPopularityIndex } from "../types/rezervoTypes";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { useRouter } from "next/router";

function WeekSchedule({
    currentSchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    onSelectedChanged,
    onInfo,
}: {
    currentSchedule: SitSchedule;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    allConfigsIndex: AllConfigsIndex | null;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (classId: string, selected: boolean) => void;
    // eslint-disable-next-line no-unused-vars
    onInfo: (c: SitClass) => void;
}) {
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
    );
}

export default WeekSchedule;
