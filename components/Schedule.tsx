import React, {useState, useEffect} from "react";
import {
    Box, Button, Card, CardActions, CardContent,
    Checkbox,
    Container,
    Divider,
    FormControlLabel,
    FormGroup,
    Stack,
    Typography,
    useTheme
} from "@mui/material";
import ClassCard from "./ClassCard";

const Schedule = (
    {
        schedule,
        addClass,
        removeClass
    }: {
        schedule: any,
        addClass: (_class: any) => void,
        removeClass: (_class: any) => void
    }
) => {

    const theme = useTheme()

    return (
        <Stack direction={"row"}>
            {schedule.days.map((day: any) =>
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
                            day.classes.map((_class: any) =>
                                (
                                    // <FormControlLabel
                                    //     key={_class.id}
                                    //     control={<Checkbox
                                    //         onChange={(e) => e.target.checked ? addClass(_class) : removeClass(_class)}/>}
                                    //     label={`${_class.name} (${timeFromISOString(_class.from)} - ${timeFromISOString(_class.to)})`}
                                    // />
                                    <Box key={_class.id} mb={1}>
                                        <ClassCard _class={_class} addClass={addClass} removeClass={removeClass} />
                                    </Box>
                                ))
                        ) : <p>Ingen gruppetimer</p>}
                    </Box>
                ))}
        </Stack>
    )
}

export default Schedule