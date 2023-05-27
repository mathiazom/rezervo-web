import { SitClass } from "../types/sitTypes";
import React from "react";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { DateTime } from "luxon";
import { Box } from "@mui/material";

function AddClassToCalendarButton({ _class }: { _class: SitClass }) {
    const startDate = DateTime.fromISO(_class.from);
    const endDate = DateTime.fromISO(_class.to);
    return (
        <Box sx={{ marginLeft: -0.7, marginTop: 1 }}>
            <AddToCalendarButton
                name={_class.name}
                description={_class.description}
                startDate={startDate.toISODate() ?? ""}
                startTime={startDate.toFormat("HH:mm")}
                endDate={endDate.toISODate() ?? ""}
                endTime={endDate.toFormat("HH:mm")}
                timeZone="Europe/Oslo"
                location={_class.studio.name}
                // This can be set explicitly when one shot booking is implemented
                recurrence="weekly"
                recurrence_interval="1"
                availability="busy"
                options="'iCal','Apple','Google'"
                listStyle="overlay"
                buttonStyle="default"
                hideCheckmark
                size="4"
                label="Legg til i kalender"
                lightMode="system"
                language="no"
            />
        </Box>
    );
}

export default AddClassToCalendarButton;
