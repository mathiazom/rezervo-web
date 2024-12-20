import { Box, Chip, Divider, Typography, useTheme } from "@mui/material";
import React, { useMemo } from "react";

import ClassCard from "@/components/schedule/class/ClassCard";
import CurrentTimeDivider from "@/components/schedule/CurrentTimeDivider";
import {
    getCapitalizedWeekday,
    isClassInThePast,
    isClassExcludedByTimeFilter,
    isDayPassed,
    isToday,
    LocalizedDateTime,
} from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { ChainIdentifier, ExcludeClassTimeFilter, RezervoClass, RezervoDaySchedule } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

function DaySchedule({
    chain,
    daySchedule,
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
    daySchedule: RezervoDaySchedule;
    selectedLocationIds: string[];
    selectedCategories: string[];
    excludeClassTimeFilters: ExcludeClassTimeFilter[];
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    scrollToTodayRef: React.MutableRefObject<HTMLDivElement | null>;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    onInfo: (c: RezervoClass) => void;
}) {
    const theme = useTheme();

    const filteredClasses = useMemo(
        () =>
            daySchedule.classes.filter(
                (c) =>
                    selectedLocationIds.includes(c.location.id) &&
                    selectedCategories.includes(c.activity.category) &&
                    !excludeClassTimeFilters.some((filter) => isClassExcludedByTimeFilter(c, filter)),
            ),
        [daySchedule.classes, selectedLocationIds, selectedCategories, excludeClassTimeFilters],
    );

    const dayIsToday = isToday(daySchedule.date);

    const scrollToTodayClassId = useMemo(() => {
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
    }, [dayIsToday, filteredClasses]);

    return (
        <Box
            width={196}
            key={daySchedule.date.toString()}
            ref={dayIsToday && scrollToTodayClassId == null ? scrollToTodayRef : null}
            sx={{
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
                              '[data-mui-color-scheme="dark"] &': {
                                  backgroundColor: hexWithOpacityToRgb(theme.palette.primary.main, 0.2, 0),
                              },
                          }
                        : {
                              backgroundColor: theme.palette.background.default,
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
            <Box padding={"0 0.5rem 2rem 0.5rem"} marginTop={"0.5rem"}>
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((_class) => (
                        <Box key={_class.id}>
                            {dayIsToday && _class.id === scrollToTodayClassId && !isClassInThePast(_class) && (
                                <CurrentTimeDivider />
                            )}
                            <Box
                                mb={1}
                                ref={dayIsToday && _class.id === scrollToTodayClassId ? scrollToTodayRef : null}
                            >
                                <ClassCard
                                    chain={chain}
                                    _class={_class}
                                    popularity={
                                        classPopularityIndex[classRecurrentId(_class)] ?? ClassPopularity.Unknown
                                    }
                                    selectable={selectable}
                                    selected={
                                        selectedClassIds != null && selectedClassIds.includes(classRecurrentId(_class))
                                    }
                                    onUpdateConfig={(s) => onUpdateConfig(classRecurrentId(_class), s)}
                                    onInfo={() => onInfo(_class)}
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
