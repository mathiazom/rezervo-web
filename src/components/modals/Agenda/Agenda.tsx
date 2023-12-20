import { CalendarToday, EventRepeat, PauseCircleRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Tooltip, Typography, useTheme } from "@mui/material";
import React from "react";

import AgendaClassItem, { AgendaClass } from "@/components/modals/Agenda/AgendaClassItem";
import { getCapitalizedWeekdays } from "@/lib/helpers/date";
import { classConfigRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { ChainProfile, RezervoClass } from "@/types/chain";
import { ClassConfig } from "@/types/config";

export default function Agenda({
    agendaClasses,
    onInfo,
    onDelete,
    chainProfile,
}: {
    agendaClasses: AgendaClass[];
    onInfo: (c: RezervoClass) => void;
    onDelete: (cc: ClassConfig) => void;
    chainProfile: ChainProfile;
}) {
    const theme = useTheme();
    const { userConfig } = useUserConfig(chainProfile.identifier);

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
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" component="h2">
                    Min timeplan
                </Typography>
                <Tooltip title={chainProfile.name}>
                    <Avatar sx={{ width: 22, height: 22 }} src={chainProfile.images.common.smallLogo ?? ""}>
                        {chainProfile.identifier}
                    </Avatar>
                </Tooltip>
            </Box>
            <Typography
                variant="body2"
                style={{
                    color: theme.palette.grey[600],
                    fontSize: 15,
                }}
                mb={1}
            >
                Disse timene vil bli booket automatisk
            </Typography>
            {userConfig?.active === false && (
                <Alert severity={"info"} icon={<PauseCircleRounded />}>
                    <AlertTitle>Automatisk booking er satt på pause</AlertTitle>
                    Du kan skru på automatisk booking i innstillinger, slik at timene i timeplanen blir booket
                    automatisk
                </Alert>
            )}
            {agendaClasses.length === 0 && (
                <Alert
                    severity={"info"}
                    sx={{ mt: userConfig?.active ? 4 : 1 }}
                    icon={<CalendarToday fontSize={"small"} />}
                >
                    <AlertTitle>Ingen timer planlagt</AlertTitle>
                    Trykk på <EventRepeat fontSize={"small"} sx={{ mb: -0.5 }} /> -ikonet i oversikten for å legge til
                    en time i timeplanen.
                </Alert>
            )}
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
                                                    bookingActive={userConfig?.active === true}
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
