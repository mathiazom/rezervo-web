import { alpha, Box, Stack, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import DaySchedule from "@/components/schedule/DaySchedule";
import { ChainIdentifier } from "@/lib/activeChains";
import { isToday } from "@/lib/helpers/date";
import { RezervoClass, RezervoWeekSchedule } from "@/types/chain";
import { ClassPopularityIndex } from "@/types/popularity";

function WeekSchedule({
    chain,
    weekSchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    todayRef,
    onSelectedChanged,
    onInfo,
}: {
    chain: ChainIdentifier;
    weekSchedule: RezervoWeekSchedule;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    todayRef: React.MutableRefObject<HTMLDivElement | null>;
    onSelectedChanged: (classId: string, selected: boolean) => void;
    onInfo: (c: RezervoClass) => void;
}) {
    const theme = useTheme();
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
        <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative", zIndex: 0 }}>
            <Stack direction={"column"}>
                <Stack direction={"row"} margin={"auto"} paddingX={"0.5rem"}>
                    {weekSchedule.map((daySchedule) => {
                        const dayIsToday = isToday(daySchedule.date);
                        return (
                            <Box
                                key={daySchedule.date.toString()}
                                ref={dayIsToday ? todayRef : null}
                                paddingX={dayIsToday ? "0.9rem" : "0.5rem"}
                                marginX={dayIsToday ? "0.1rem" : "0rem"}
                                sx={{
                                    ...(dayIsToday
                                        ? {
                                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                              '[data-mui-color-scheme="dark"] &': {
                                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                              },
                                          }
                                        : {}),
                                }}
                            >
                                <DaySchedule
                                    chain={chain}
                                    daySchedule={daySchedule}
                                    classPopularityIndex={classPopularityIndex}
                                    selectable={selectable}
                                    selectedClassIds={selectedClassIds}
                                    onSelectedChanged={onSelectedChanged}
                                    onInfo={onInfo}
                                />
                            </Box>
                        );
                    })}
                </Stack>
            </Stack>
        </Box>
    );
}

export default WeekSchedule;
