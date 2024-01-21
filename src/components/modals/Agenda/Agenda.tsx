import { CalendarToday, EventRepeat, PauseCircleRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Typography, useTheme } from "@mui/material";
import React from "react";

import AgendaClassItem, { AgendaClass } from "@/components/modals/Agenda/AgendaClassItem";
import { getCapitalizedWeekdays } from "@/lib/helpers/date";
import { classConfigRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { ClassConfig } from "@/types/config";

export default function Agenda({
    agendaClasses,
    onInfo,
    onDelete,
    bookingActive,
}: {
    agendaClasses: AgendaClass[];
    onInfo: (c: RezervoClass) => void;
    onDelete: (cc: ClassConfig) => void;
    bookingActive: boolean;
}) {
    const theme = useTheme();
    const hasGhostClasses = agendaClasses.some((agendaClass) => agendaClass._class === undefined);

    // Establish sort order of config classes
    const configTimeMinutes = (cc: ClassConfig) => cc.startTime.hour * 60 + cc.startTime.minute;

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "95%",
                maxHeight: "80%",
                overflowY: "scroll",
                maxWidth: 500,
                minHeight: 300,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                p: 4,
                backgroundColor: "white",
                '[data-mui-color-scheme="dark"] &': {
                    backgroundColor: "#181818",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" component="h2">
                    Min timeplan
                </Typography>
            </Box>
            <Typography
                variant="body2"
                style={{
                    color: theme.palette.grey[600],
                    fontSize: 15,
                }}
                mb={2.5}
            >
                Disse timene vil bli booket automatisk
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                }}
            >
                {!bookingActive && (
                    <Alert severity={"info"} icon={<PauseCircleRounded />}>
                        <AlertTitle>Automatisk booking er satt på pause</AlertTitle>
                        Du kan skru på automatisk booking i Innstillinger, slik at timene i timeplanen blir booket
                        automatisk
                    </Alert>
                )}
                {hasGhostClasses && bookingActive && (
                    <Alert
                        severity={"error"}
                        icon={
                            <Avatar
                                alt={"Ghost class"}
                                src={"/ghost.png"}
                                sx={{
                                    width: 20,
                                    height: 20,
                                }}
                            />
                        }
                    >
                        <AlertTitle>Utdatert timeplan</AlertTitle>
                        En eller flere av timene i planen din går ikke denne uka. Kontroller at planen din stemmer
                        overens med ukas gruppetimer.
                    </Alert>
                )}
                {agendaClasses.length === 0 && (
                    <Alert severity={"info"} icon={<CalendarToday fontSize={"small"} />}>
                        <AlertTitle>Ingen timer planlagt</AlertTitle>
                        Trykk på <EventRepeat fontSize={"small"} sx={{ mb: -0.5 }} /> -ikonet i oversikten for å legge
                        til en time i timeplanen.
                    </Alert>
                )}
            </Box>
            <Box pt={2}>
                {[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
                    const dayClasses = agendaClasses.filter((a) => a.config.weekday === weekday);
                    const weekdays = getCapitalizedWeekdays();
                    return (
                        <>
                            {dayClasses && dayClasses.length > 0 && (
                                <Box pb={2} key={weekday}>
                                    <Typography
                                        variant="h6"
                                        style={{
                                            color: theme.palette.grey[600],
                                            fontSize: 15,
                                        }}
                                        mb={0.5}
                                    >
                                        {weekdays[weekday]}
                                    </Typography>
                                    {dayClasses
                                        .sort((a, b) => configTimeMinutes(a.config) - configTimeMinutes(b.config))
                                        .map((cls) => (
                                            <Box key={classConfigRecurrentId(cls.config)} py={0.5}>
                                                <AgendaClassItem
                                                    agendaClass={cls}
                                                    onDelete={onDelete}
                                                    onInfo={() => cls._class && onInfo(cls._class)}
                                                    // onSettings={() =>
                                                    //     setSettingsClass(_class)
                                                    // }
                                                />
                                            </Box>
                                        ))}
                                </Box>
                            )}
                        </>
                    );
                })}
            </Box>
        </Box>
    );
}
