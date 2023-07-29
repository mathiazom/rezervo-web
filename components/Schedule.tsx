import React from "react";
import { Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import ClassCard from "./ClassCard/ClassCard";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { sitClassRecurrentId } from "../lib/iBooking";
import { DateTime } from "luxon";
import { SIT_TIMEZONE } from "../config/config";
import { ClassPopularity, ClassPopularityIndex, AllConfigsIndex, UserSessionsIndex } from "../types/rezervoTypes";

const Schedule = ({
    schedule,
    classPopularityIndex,
    selectable,
    selectedClassIds,
    allConfigsIndex,
    userSessionsIndex,
    onSelectedChanged,
    onInfo,
}: {
    schedule: SitSchedule;
    classPopularityIndex: ClassPopularityIndex;
    selectable: boolean;
    selectedClassIds: string[] | null;
    allConfigsIndex: AllConfigsIndex | null;
    userSessionsIndex: UserSessionsIndex | null;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (classId: string, selected: boolean) => void;
    // eslint-disable-next-line no-unused-vars
    onInfo: (c: SitClass) => void;
}) => {
    const theme = useTheme();

    function sameDay(a: DateTime, b: DateTime): boolean {
        return a.startOf("day") <= b && b <= a.endOf("day");
    }

    function isToday(dateStr: string) {
        return sameDay(DateTime.fromISO(dateStr, { zone: SIT_TIMEZONE }), DateTime.now());
    }

    function isDayPassed(dateStr: string) {
        return DateTime.fromISO(dateStr, { zone: SIT_TIMEZONE }).endOf("day") > DateTime.now();
    }

    return (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            <Stack direction={"column"}>
                <Stack direction={"row"} margin={"auto"} spacing={2} px={1}>
                    {schedule.days.map((day) => (
                        <Box key={day.date} width={180}>
                            <Box py={2} sx={{ opacity: isDayPassed(day.date) ? 1 : 0.5 }}>
                                <Typography variant="h6" component="div">
                                    {day.dayName}{" "}
                                    {isToday(day.date) && (
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
                                    {day.date}
                                </Typography>
                            </Box>
                            {day.classes.length > 0 ? (
                                day.classes.map((_class) => (
                                    <Box key={_class.id} mb={1}>
                                        <ClassCard
                                            _class={_class}
                                            popularity={
                                                classPopularityIndex[sitClassRecurrentId(_class)] ??
                                                ClassPopularity.Unknown
                                            }
                                            configUsers={
                                                allConfigsIndex
                                                    ? allConfigsIndex[sitClassRecurrentId(_class)] ?? []
                                                    : []
                                            }
                                            userSessions={userSessionsIndex ? userSessionsIndex[_class.id] ?? [] : []}
                                            selectable={selectable}
                                            selected={
                                                selectedClassIds != null &&
                                                selectedClassIds.includes(sitClassRecurrentId(_class))
                                            }
                                            onSelectedChanged={(s) => onSelectedChanged(sitClassRecurrentId(_class), s)}
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
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
};

export default Schedule;
