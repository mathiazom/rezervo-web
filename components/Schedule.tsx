import React from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import ClassCard from "./ClassCard/ClassCard";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { weekdayNameToNumber } from "../utils/timeUtils";
import { ActivityPopularity, ClassPopularity } from "../types/derivedTypes";
import { sitClassRecurrentId } from "../lib/iBooking";

const Schedule = ({
    schedule,
    activitiesPopularity,
    selectable,
    selectedClassIds,
    onSelectedChanged,
    onInfo,
}: {
    schedule: SitSchedule;
    activitiesPopularity: ActivityPopularity[];
    selectable: boolean;
    selectedClassIds: string[];
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (classId: string, selected: boolean) => void;
    // eslint-disable-next-line no-unused-vars
    onInfo: (c: SitClass) => void;
}) => {
    const theme = useTheme();

    const lookupClassPopularity = (_class: SitClass) =>
        activitiesPopularity.find((activityPopularity) => activityPopularity.activityId === _class.activityId)
            ?.popularity ?? ClassPopularity.Unknown;

    return (
        <Stack direction={"column"}>
            <Stack direction={"row"} margin={"auto"} spacing={2} px={1}>
                {schedule.days.map((day) => (
                    <Box key={day.date} width={180}>
                        <Box py={2}>
                            <Typography variant="h6" component="div">
                                {day.dayName}
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
                            day.classes.map((_class) => {
                                _class.weekday = weekdayNameToNumber(day.dayName);
                                return (
                                    <Box key={_class.id} mb={1}>
                                        <ClassCard
                                            _class={_class}
                                            popularity={lookupClassPopularity(_class)}
                                            selectable={selectable}
                                            selected={selectedClassIds.includes(sitClassRecurrentId(_class))}
                                            onSelectedChanged={(s) => onSelectedChanged(sitClassRecurrentId(_class), s)}
                                            onInfo={() => onInfo(_class)}
                                            // onSettings={() =>
                                            //     setSettingsClass(_class)
                                            // }
                                        />
                                    </Box>
                                );
                            })
                        ) : (
                            <p>Ingen gruppetimer</p>
                        )}
                    </Box>
                ))}
            </Stack>
        </Stack>
    );
};

export default Schedule;
