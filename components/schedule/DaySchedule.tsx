import { Box, Chip, Typography, useTheme } from "@mui/material";
import ClassCard from "./class/ClassCard";
import {
    AllConfigsIndex,
    ClassPopularity,
    ClassPopularityIndex,
    RezervoClass,
    RezervoDaySchedule,
} from "../../types/rezervo";
import React from "react";
import { DateTime } from "luxon";
import { classRecurrentId, getCapitalizedWeekday, getDateTime } from "../../lib/integration/common";

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

    const date = getDateTime(daySchedule.date);

    return (
        <Box key={daySchedule.date.toString()} width={180}>
            <Box py={2} sx={{ opacity: isDayPassed(date) ? 1 : 0.5 }}>
                <Typography variant="h6" component="div">
                    {getCapitalizedWeekday(date)}{" "}
                    {isToday(date) && (
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
                    {date.toFormat("yyyy-MM-dd")}
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
                            // onSettings={() =>
                            //     setSettingsClass(_class)
                            // }
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
