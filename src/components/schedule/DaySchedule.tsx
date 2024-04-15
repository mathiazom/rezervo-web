import { Box, Chip, Typography, useTheme } from "@mui/material";
import React, { useMemo } from "react";

import ClassCard from "@/components/schedule/class/ClassCard";
import CurrentTimeDivider from "@/components/schedule/CurrentTimeDivider";
import { getCapitalizedWeekday, isClassInThePast, isDayPassed, isToday, LocalizedDateTime } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { ChainIdentifier, RezervoClass, RezervoDaySchedule } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

function DaySchedule({
    chain,
    daySchedule,
    selectedLocationIds,
    selectedCategories,
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
                (c) => selectedLocationIds.includes(c.location.id) && selectedCategories.includes(c.activity.category),
            ),
        [daySchedule.classes, selectedLocationIds, selectedCategories],
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
            key={daySchedule.date.toString()}
            width={180}
            ref={dayIsToday && scrollToTodayClassId == null ? scrollToTodayRef : null}
        >
            <Box
                sx={{
                    padding: "0.75rem 0.5rem 1rem 0.5rem",
                    opacity: isDayPassed(daySchedule.date) ? 1 : 0.5,
                }}
            >
                <Typography variant="h6" component="div">
                    {getCapitalizedWeekday(daySchedule.date)}{" "}
                    {dayIsToday && (
                        <Chip
                            size={"small"}
                            sx={{ backgroundColor: theme.palette.primary.dark, color: "#fff" }}
                            label="I dag"
                        />
                    )}
                </Typography>
                <Typography
                    variant="h6"
                    component="div"
                    style={{
                        color: theme.palette.grey[600],
                        fontSize: 15,
                    }}
                >
                    {daySchedule.date.toFormat("yyyy-MM-dd")}
                </Typography>
            </Box>
            {filteredClasses.length > 0 ? (
                filteredClasses.map((_class) => (
                    <Box key={_class.id}>
                        {dayIsToday && _class.id === scrollToTodayClassId && !isClassInThePast(_class) && (
                            <CurrentTimeDivider />
                        )}
                        <Box mb={1} ref={dayIsToday && _class.id === scrollToTodayClassId ? scrollToTodayRef : null}>
                            <ClassCard
                                chain={chain}
                                _class={_class}
                                popularity={classPopularityIndex[classRecurrentId(_class)] ?? ClassPopularity.Unknown}
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
    );
}

export default DaySchedule;
