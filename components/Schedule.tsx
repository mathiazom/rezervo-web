import React from "react";
import {Box, Stack, Typography, useTheme} from "@mui/material";
import ClassCard from "./ClassCard/ClassCard";
import {SitSchedule} from "../types/sitTypes";
import {weekdayNameToNumber} from "../utils/timeUtils";
import {ActivityPopularity, ClassPopularity} from "../types/derivedTypes";

const Schedule = (
    {
        schedule,
        previousActivities,
        onSelectedChanged
    }: {
        schedule: SitSchedule,
        previousActivities: ActivityPopularity[],
        onSelectedChanged: (classId: string, selected: boolean) => void
    }
) => {

    const theme = useTheme()

    return (
        <Stack direction={"row"}>
            {schedule.days.map((day) =>
                (
                    <Box key={day.date} width={200} pr={2}>
                        <Box py={2} width={200}>
                            <Typography variant="h6" component="div">
                                {day.dayName}
                            </Typography>
                            <Typography variant="h6" component="div"
                                        style={{color: theme.palette.grey[600], fontSize: 15}}>
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
                                            activityPopularity={previousActivities.find(
                                                (activityPopularity) => activityPopularity.activityId ===  _class.activityId)
                                                ?? {popularity: ClassPopularity.Unknown} as ActivityPopularity
                                        }
                                            onSelectedChanged={(s) => onSelectedChanged(_class.id.toString(), s)}
                                        />
                                    </Box>
                                );
                            })
                        ) : <p>Ingen gruppetimer</p>}
                    </Box>
                ))}
        </Stack>
    )
}

export default Schedule
