import { Box, Chip, Divider, Typography, useTheme } from "@mui/material";

import ClassCard from "@/components/schedule/class/ClassCard";
import CurrentTimeDivider from "@/components/schedule/CurrentTimeDivider";
import {
    getCapitalizedWeekday,
    isClassExcludedByTimeFilters,
    isClassInThePast,
    isDayPassed,
    isToday,
    LocalizedDateTime,
} from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { vars } from "@/lib/theme";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { RezervoClass, RezervoDaySchedule } from "@/types/openapi";
import { ExcludeClassTimeFiltersType } from "@/types/local";

function DaySchedule({
    daySchedule,
    selectedLocationIds,
    selectedCategories,
    excludeClassTimeFilters,
    selectable,
    selectedClassIds,
    scrollToTodayRef,
    onUpdateConfig,
    setClassInfoClass,
}: {
    daySchedule: RezervoDaySchedule;
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

    const filteredClasses = daySchedule.classes.filter(
        (c) =>
            selectedLocationIds.includes(c.location.id) &&
            selectedCategories.includes(c.activity.category) &&
            !isClassExcludedByTimeFilters(c, excludeClassTimeFilters),
    );

    const dayIsToday = isToday(daySchedule.date);

    const scrollToTodayClassId = (() => {
        if (!dayIsToday) return null;
        const now = LocalizedDateTime.now();
        let mostRecent = null;
        // find the most recent class where start is in the past, with fallback to next class if no classes in the past
        // we assume that filteredClasses is chronological from first to last
        for (const c of filteredClasses) {
            mostRecent = c;
            if (c.startTime >= now) {
                break;
            }
        }
        return mostRecent?.id ?? null;
    })();

    return (
        <Box
            key={daySchedule.date.toString()}
            ref={dayIsToday && scrollToTodayClassId == null ? scrollToTodayRef : null}
            sx={{
                width: 196,
                flexGrow: 1,
            }}
        >
            <Box
                sx={[
                    {
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                    },
                    dayIsToday
                        ? {
                              backgroundColor: hexWithOpacityToRgb(theme.palette.primary.main, 0.1, 255),
                              "@media (prefers-color-scheme: dark)": {
                                  backgroundColor: hexWithOpacityToRgb(theme.palette.primary.main, 0.2, 0),
                              },
                          }
                        : {
                              backgroundColor: vars(theme).palette.background.default,
                          },
                ]}
            >
                <Box
                    sx={{
                        opacity: isDayPassed(daySchedule.date) ? 1 : 0.5,
                        padding: "0.5rem 1rem",
                    }}
                >
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    >
                        {getCapitalizedWeekday(daySchedule.date)}{" "}
                        {dayIsToday && (
                            <Chip
                                size={"small"}
                                sx={{
                                    backgroundColor: theme.palette.primary.dark,
                                    color: "#fff",
                                    fontSize: "0.7rem",
                                    height: "18px",
                                }}
                                label="I dag"
                            />
                        )}
                    </Typography>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            color: theme.palette.grey[600],
                            fontSize: "0.875rem",
                        }}
                    >
                        {daySchedule.date.toFormat("yyyy-MM-dd")}
                    </Typography>
                </Box>
                <Divider orientation="horizontal" />
            </Box>
            <Box
                sx={{
                    padding: "0 0.5rem 2rem 0.5rem",
                    marginTop: "0.5rem",
                }}
            >
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((_class) => (
                        <Box key={_class.id}>
                            {dayIsToday && _class.id === scrollToTodayClassId && !isClassInThePast(_class) && (
                                <CurrentTimeDivider />
                            )}
                            <Box
                                ref={dayIsToday && _class.id === scrollToTodayClassId ? scrollToTodayRef : null}
                                sx={{
                                    mb: 1,
                                }}
                            >
                                <ClassCard
                                    _class={_class}
                                    selectable={selectable}
                                    selected={
                                        selectedClassIds != null && selectedClassIds.includes(classRecurrentId(_class))
                                    }
                                    onUpdateConfig={(s) => onUpdateConfig(classRecurrentId(_class), s)}
                                    onShowClassInfo={() => setClassInfoClass(_class)}
                                />
                            </Box>
                        </Box>
                    ))
                ) : (
                    <>
                        <p>Ingen gruppetimer</p>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default DaySchedule;
