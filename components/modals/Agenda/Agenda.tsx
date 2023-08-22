import { Box, Typography, useTheme } from "@mui/material";
import React from "react";

import { classConfigRecurrentId } from "../../../lib/integration/common";
import { ClassConfig, RezervoClass } from "../../../types/rezervo";
import { WEEKDAY_NUMBER_TO_NAME } from "../../../utils/timeUtils";
import AgendaClassItem, { AgendaClass } from "./AgendaClassItem";

export default function Agenda({
    agendaClasses,
    onInfo,
    onSetToDelete,
}: {
    agendaClasses: AgendaClass[];
    onInfo: (c: RezervoClass) => void;
    onSetToDelete: (cc: ClassConfig, toDelete: boolean) => void;
}) {
    const theme = useTheme();

    // Establish sort order of config classes
    const configTimeMinutes = (cc: ClassConfig) => cc.time.hour * 60 + cc.time.minute;

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
                backgroundColor: theme.palette.background.paper,
                borderRadius: "0.25em",
                boxShadow: 24,
                p: 4,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    paddingBottom: 1,
                }}
            >
                <Typography variant="h6" component="h2">
                    Agenda
                </Typography>
            </Box>
            <Box pt={2}>
                {Array.from(WEEKDAY_NUMBER_TO_NAME).map(([dayNumber, dayName]) => {
                    const dayClasses = agendaClasses.filter((a) => a.config.weekday === dayNumber);
                    return (
                        <>
                            {dayClasses && dayClasses.length > 0 && (
                                <Box pb={2} key={dayNumber}>
                                    <Typography
                                        variant="h6"
                                        style={{
                                            color: theme.palette.grey[600],
                                            fontSize: 15,
                                        }}
                                        mb={0.5}
                                    >
                                        {dayName}
                                    </Typography>
                                    {dayClasses
                                        .sort((a, b) => configTimeMinutes(a.config) - configTimeMinutes(b.config))
                                        .map((cls) => (
                                            <Box key={classConfigRecurrentId(cls.config)} py={0.5}>
                                                <AgendaClassItem
                                                    agendaClass={cls}
                                                    onSetToDelete={(toDelete: boolean) =>
                                                        onSetToDelete(cls.config, toDelete)
                                                    }
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
