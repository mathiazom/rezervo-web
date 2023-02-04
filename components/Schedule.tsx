import React from "react";
import {Box, Stack, Typography, useTheme} from "@mui/material";
import ClassCard from "./ClassCard/ClassCard";
import {SitSchedule} from "../types/sitTypes";
import {weekdayNameToNumber} from "../utils/timeUtils";

const Schedule = (
    {
        schedule,
        onSelectedChanged
    }: {
        schedule: SitSchedule,
        onSelectedChanged: (classId: string, selected: boolean) => void
    }
) => {

    const theme = useTheme()

    return (
        <Stack direction={"row"}>
            {schedule.days.map((day) =>
                (
                    <Box key={day.date} px={1} width={200}>
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