import { Box, Chip, Typography, useTheme } from "@mui/material";
import { DateTime } from "luxon";
import React from "react";

import ClassCard from "@/components/schedule/class/ClassCard";
import { getCapitalizedWeekday } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";
import { AllConfigsIndex, RezervoClass, RezervoDaySchedule } from "@/types/rezervo";

function DaySchedule({
    daySchedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    onSelectedChanged,
    onInfo,
}: {
    daySchedule: RezervoDaySchedule;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    allConfigsIndex: AllConfigsIndex | null;
    onSelectedChanged: (classId: string, selected: boolean) => void;
    onInfo: (c: RezervoClass) => void;
}) {
    const theme = useTheme();

    function sameDay(a: DateTime, b: DateTime): boolean {
        return a.startOf("day") <= b && b <= a.endOf("day");
    }
    function isToday(date: DateTime) {
        return sameDay(date, DateTime.now());
    }
    function isDayPassed(date: DateTime) {
        return date.endOf("day") > DateTime.now();
    }

    return (
        <Box key={daySchedule.date.toString()} width={180}>
            <Box py={2} sx={{ opacity: isDayPassed(daySchedule.date) ? 1 : 0.5 }}>
                <Typography variant="h6" component="div">
                    {getCapitalizedWeekday(daySchedule.date)}{" "}
                    {isToday(daySchedule.date) && (
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
            {daySchedule.classes.length > 0 ? (
                daySchedule.classes.map((_class) => (
                    <Box key={_class.id} mb={1}>
                        <ClassCard
                            _class={_class}
                            popularity={classPopularityIndex[classRecurrentId(_class)] ?? ClassPopularity.Unknown}
                            configUsers={allConfigsIndex ? allConfigsIndex[classRecurrentId(_class)] ?? [] : []}
                            selectable={selectable}
                            selected={selectedClassIds != null && selectedClassIds.includes(classRecurrentId(_class))}
                            onSelectedChanged={(s) => onSelectedChanged(classRecurrentId(_class), s)}
                            onInfo={() => onInfo(_class)}
                        />
                    </Box>
                ))
            ) : (
                <p>Ingen gruppetimer</p>
            )}
        </Box>
    );
}

export default DaySchedule;
