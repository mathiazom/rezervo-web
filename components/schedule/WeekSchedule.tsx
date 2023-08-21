import { Box, Stack } from "@mui/material";
import DaySchedule from "./DaySchedule";
import React, { useEffect } from "react";
import { AllConfigsIndex, ClassPopularityIndex, RezervoWeekSchedule } from "../../types/rezervo";
import { SitClass } from "../../types/integration/sit";
import { useRouter } from "next/router";

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
    onInfo: (c: SitClass) => void;
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
