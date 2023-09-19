import { Box, Stack } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import DaySchedule from "@/components/schedule/DaySchedule";
import { isToday } from "@/lib/helpers/date";
import { AllConfigsIndex } from "@/types/config";
import { RezervoClass, RezervoWeekSchedule } from "@/types/integration";
import { ClassPopularityIndex } from "@/types/popularity";

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
    const scrollToTodayRef = React.useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const target = scrollToTodayRef.current;
        if (target != null) {
            target.scrollIntoView({
                behavior: "smooth",
                inline: "start",
            });
        }
    }, [scrollToTodayRef]);

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
        <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative", zIndex: 0 }}>
            <Stack direction={"column"}>
                <Stack direction={"row"} margin={"auto"} paddingRight={"1rem"}>
                    {weekSchedule.map((daySchedule) => (
                        <Box
                            key={daySchedule.date.toString()}
                            ref={isToday(daySchedule.date) ? scrollToTodayRef : null}
                            paddingLeft={"1rem"}
                        >
                            <DaySchedule
                                daySchedule={daySchedule}
                                classPopularityIndex={classPopularityIndex}
                                selectable={selectable}
                                selectedClassIds={selectedClassIds}
                                allConfigsIndex={allConfigsIndex}
                                onSelectedChanged={onSelectedChanged}
                                onInfo={onInfo}
                            />
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default WeekSchedule;
