import { Box, Stack } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import DaySchedule from "components/schedule/DaySchedule";
import { AllConfigsIndex, ClassPopularityIndex, RezervoClass, RezervoWeekSchedule } from "types/rezervo";

function WeekSchedule({
    weekSchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    onSelectedChanged,
    onInfo,
}: {
    weekSchedule: RezervoWeekSchedule;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    allConfigsIndex: AllConfigsIndex | null;
    onSelectedChanged: (classId: string, selected: boolean) => void;
    onInfo: (c: RezervoClass) => void;
}) {
    const router = useRouter();

    useEffect(() => {
        const { classId, ...queryWithoutParam } = router.query;
        if (classId === undefined) {
            return;
        }
        const linkedClass = weekSchedule
            .flatMap((daySchedule) => daySchedule.classes)
            .find((_class) => _class.id === Number(classId));
        if (linkedClass) {
            onInfo(linkedClass);
        }
        router.replace({ query: queryWithoutParam });
    }, [onInfo, router, weekSchedule]);

    return (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <Stack direction={"column"}>
                <Stack direction={"row"} margin={"auto"} spacing={2} px={1}>
                    {weekSchedule.map((daySchedule) => (
                        <DaySchedule
                            key={daySchedule.date.toString()}
                            daySchedule={daySchedule}
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
