import { alpha, Box, Stack, useTheme } from "@mui/material";

import DaySchedule from "@/components/schedule/DaySchedule";
import { isToday } from "@/lib/helpers/date";
import { RezervoClass, RezervoWeekSchedule } from "@/types/openapi";
import { ExcludeClassTimeFiltersType } from "@/types/local";

function WeekSchedule({
    weekSchedule,
    selectedLocationIds,
    selectedCategories,
    excludeClassTimeFilters,
    selectable,
    selectedClassIds,
    scrollToTodayRef,
    onUpdateConfig,
    setClassInfoClass,
}: {
    weekSchedule: RezervoWeekSchedule;
    selectedLocationIds: string[];
    selectedCategories: string[];
    excludeClassTimeFilters: ExcludeClassTimeFiltersType;
    selectable: boolean;
    selectedClassIds: string[] | null;
    scrollToTodayRef: React.RefObject<HTMLDivElement | null>;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    setClassInfoClass: (c: RezervoClass) => void;
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
                                              "@media (prefers-color-scheme: dark)": {
                                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                              },
                                          }
                                        : {},
                                ]}
                            >
                                <DaySchedule
                                    daySchedule={daySchedule}
                                    selectedLocationIds={selectedLocationIds}
                                    selectedCategories={selectedCategories}
                                    excludeClassTimeFilters={excludeClassTimeFilters}
                                    selectable={selectable}
                                    selectedClassIds={selectedClassIds}
                                    scrollToTodayRef={scrollToTodayRef}
                                    onUpdateConfig={onUpdateConfig}
                                    setClassInfoClass={setClassInfoClass}
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
