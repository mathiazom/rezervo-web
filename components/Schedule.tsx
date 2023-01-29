import React from "react";
import {
    Box,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import ClassCard from "./ClassCard";
import {SitClass, SitSchedule} from "../types/sit_types";

const WEEKDAY_NAME_TO_NUMBER = new Map([
    ["Mandag", 0],
    ["Tirsdag", 1],
    ["Onsdag", 2],
    ["Torsdag", 3],
    ["Fredag", 4],
    ["Lørdag", 5],
    ["Søndag", 6]
])

const Schedule = (
    {
        schedule,
        addClass,
        removeClass
    }: {
        schedule: SitSchedule,
        addClass: (_class: SitClass) => void,
        removeClass: (_class: SitClass) => void
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
                                _class.weekday = WEEKDAY_NAME_TO_NUMBER.get(day.dayName);
                                return (
                                    <Box key={_class.id} mb={1}>
                                        <ClassCard _class={_class} addClass={addClass} removeClass={removeClass}/>
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