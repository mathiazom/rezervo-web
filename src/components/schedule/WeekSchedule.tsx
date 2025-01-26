import { alpha, Box, Stack, useTheme } from "@mui/material";
import React from "react";

import DaySchedule from "@/components/schedule/DaySchedule";
import { isToday } from "@/lib/helpers/date";
import { ChainIdentifier, ExcludeClassTimeFiltersType, RezervoClass, RezervoWeekSchedule } from "@/types/chain";
import { ClassPopularityIndex } from "@/types/popularity";

function WeekSchedule({
    chain,
    weekSchedule,
    selectedLocationIds,
    selectedCategories,
    excludeClassTimeFilters,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    scrollToTodayRef,
    onUpdateConfig,
    onInfo,
}: {
    chain: ChainIdentifier;
    weekSchedule: RezervoWeekSchedule;
    selectedLocationIds: string[];
    selectedCategories: string[];
    excludeClassTimeFilters: ExcludeClassTimeFiltersType;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    scrollToTodayRef: React.RefObject<HTMLDivElement | null>;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    onInfo: (c: RezervoClass) => void;
}) {
    const theme = useTheme();

    return (
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "auto", position: "relative", zIndex: 0 }}>
            <Stack direction={"column"} sx={{ flexGrow: "1" }}>
                <Stack
                    direction={"row"}
                    sx={{
                        margin: "auto",
                        paddingX: "0.5rem",
                        flexGrow: "1",
                    }}
                >
                    {weekSchedule.days.map((daySchedule) => {
                        const dayIsToday = isToday(daySchedule.date);
                        return (
                            <Box
                                key={daySchedule.date.toString()}
                                sx={[
                                    {
                                        display: "flex",
                                    },
                                    dayIsToday
                                        ? {
                                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                              '[data-mui-color-scheme="dark"] &': {
                                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                              },
                                          }
                                        : {},
                                ]}
                            >
                                <DaySchedule
                                    chain={chain}
                                    daySchedule={daySchedule}
                                    selectedLocationIds={selectedLocationIds}
                                    selectedCategories={selectedCategories}
                                    excludeClassTimeFilters={excludeClassTimeFilters}
                                    classPopularityIndex={classPopularityIndex}
                                    selectable={selectable}
                                    selectedClassIds={selectedClassIds}
                                    scrollToTodayRef={scrollToTodayRef}
                                    onUpdateConfig={onUpdateConfig}
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
