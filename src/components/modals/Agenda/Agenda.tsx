import { CalendarMonth, CalendarToday, EventRepeat, PauseCircleRounded, SettingsRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Typography, useTheme } from "@mui/material";
import React from "react";

import AgendaClassItem from "@/components/modals/Agenda/AgendaClassItem";
import { PLANNED_SESSIONS_NEXT_WHOLE_WEEKS } from "@/lib/consts";
import { capitalizeFirstCharacter } from "@/lib/helpers/date";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig, ClassConfig } from "@/types/config";
import { SessionStatus, UserAgendaClass } from "@/types/userSessions";

function mapClassesByStartTime(classes: UserAgendaClass[]): Record<string, UserAgendaClass[]> {
    return classes.reduce<Record<string, UserAgendaClass[]>>((acc, next) => {
        const prettyStartTime = capitalizeFirstCharacter(next.class_data.startTime.toFormat("cccc d. LLLL") ?? "");
        const dayEntry = acc[prettyStartTime] ?? [];
        dayEntry.push(next);
        acc[prettyStartTime] = dayEntry;
        return acc;
    }, {});
}

function AgendaDays({ dayMap }: { dayMap: Record<string, UserAgendaClass[]> }) {
    const theme = useTheme();
    return (
        <>
            {Object.keys(dayMap).map((prettyDate) => {
                return (
                    <Box key={prettyDate}>
                        <Typography
                            variant="h6"
                            style={{
                                color: theme.palette.grey[600],
                                fontSize: 15,
                            }}
                            mb={0.5}
                        >
                            {prettyDate}
                        </Typography>
                        {dayMap[prettyDate]!.map((agendaClass) => (
                            <Box key={agendaClass.class_data.id} py={0.5}>
                                <AgendaClassItem agendaClass={agendaClass} chain={agendaClass.chain} />
                            </Box>
                        ))}
                    </Box>
                );
            })}
        </>
    );
}

function searchForGhosts(
    agenda: UserAgendaClass[],
    chainConfigs: Record<ChainIdentifier, ChainConfig>,
): Record<ChainIdentifier, ClassConfig[]> {
    const classRecurrentIds = agenda.map((_class) => classRecurrentId(_class.class_data));

    return Object.entries(chainConfigs).reduce(
        (acc, [chainIdentifier, config]) => {
            if (!config.active) {
                return acc;
            }

            const ghostClasses = config.recurringBookings.filter(
                (classConfig) => !classRecurrentIds.includes(classConfigRecurrentId(classConfig)),
            );

            if (ghostClasses.length > 0) {
                acc[chainIdentifier as ChainIdentifier] = ghostClasses;
            }

            return acc;
        },
        {} as Record<ChainIdentifier, ClassConfig[]>,
    );
}

export default function Agenda({
    agenda,
    chainConfigs,
    chainProfiles,
}: {
    agenda: UserAgendaClass[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    chainProfiles: ChainProfile[];
}) {
    const theme = useTheme();
    const plannedClassesDayMap = mapClassesByStartTime(
        agenda.filter((_class) => _class.status === SessionStatus.PLANNED),
    );
    const bookedClassesDayMap = mapClassesByStartTime(
        agenda.filter((_class) => _class.status === SessionStatus.WAITLIST || _class.status === SessionStatus.BOOKED),
    );
    const missingClassConfigs = searchForGhosts(agenda, chainConfigs);

    const inactiveChains = Object.keys(chainConfigs).filter(
        (chain) => !chainConfigs[chain as ChainIdentifier]?.active,
    ) as ChainIdentifier[];

    // TODO: handle on info, see TODO in component - need to link
    // TODO: use new linking capabilities for the Slack notifs (må hente slack deets fra rezervo-secrets)

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "95%",
                maxHeight: "80%",
                overflowY: "auto",
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
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={1} paddingBottom={2}>
                {agenda.length > 0 ? <CalendarMonth /> : <CalendarToday />}
                <Typography variant="h6" component="h2">
                    Min timeplan
                </Typography>
            </Box>
            {Object.keys(chainConfigs).length === 0 ? (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                    <AlertTitle>Koble til treningssenter-medlemskap</AlertTitle>
                    Du må koble et treningssenter-medlemskap til <b>rezervo</b> for å kunne se bookinger og planlagte
                    timer. Trykk på Innstillinger <SettingsRounded fontSize={"small"} sx={{ mb: -0.6 }} /> for å komme i
                    gang.
                </Alert>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                    }}
                >
                    {Object.entries(missingClassConfigs).length > 0 && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
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
                                En eller flere av timene i planen din er ikke satt opp de neste{" "}
                                {PLANNED_SESSIONS_NEXT_WHOLE_WEEKS} ukene. Kontroller at planen din stemmer overens med
                                treningssenteret sin timeplan.
                            </Alert>
                            <Typography variant="h6" sx={{ fontSize: 18 }}>
                                Utdaterte timer
                            </Typography>
                            {Object.entries(missingClassConfigs).flatMap(([chain, classConfigs]) =>
                                classConfigs.map((classConfig) => (
                                    <AgendaClassItem
                                        key={classConfigRecurrentId(classConfig)}
                                        classConfig={classConfig}
                                        chain={chain as ChainIdentifier}
                                    />
                                )),
                            )}
                        </Box>
                    )}
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: 18 }}>
                            Mine bookinger
                        </Typography>
                        {Object.keys(bookedClassesDayMap).length === 0 && (
                            <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic" }}>
                                Du har ingen bookinger
                            </Typography>
                        )}
                    </Box>
                    <AgendaDays dayMap={bookedClassesDayMap} />
                    <Box>
                        <Typography variant="h6" sx={{ fontSize: 18, pt: 2 }}>
                            Planlagte timer
                        </Typography>
                        <Typography
                            variant="body2"
                            style={{
                                color: theme.palette.grey[600],
                                fontSize: 15,
                            }}
                        >
                            Disse timene vil bli booket automatisk
                        </Typography>
                    </Box>
                    {inactiveChains.length > 0 &&
                        (inactiveChains.length === Object.keys(chainConfigs).length ? (
                            <Alert severity={"info"} icon={<PauseCircleRounded />}>
                                <AlertTitle>Automatisk booking er satt på pause</AlertTitle>
                                Du kan skru på automatisk booking i Innstillinger, slik at timene i timeplanen blir
                                booket automatisk
                            </Alert>
                        ) : (
                            <Alert severity={"info"} icon={<PauseCircleRounded />}>
                                <AlertTitle>Automatisk booking er delvis pauset</AlertTitle>
                                Booking er pauset for{" "}
                                {chainProfiles
                                    .filter((cp) => inactiveChains.includes(cp.identifier))
                                    .map((cp) => cp.name)
                                    .join(" og ")}
                                . Du kan skru på automatisk booking i Innstillinger, slik at timene i timeplanen blir
                                booket automatisk
                            </Alert>
                        ))}
                    {Object.values(plannedClassesDayMap).length === 0 && inactiveChains.length === 0 && (
                        <Alert severity={"info"} icon={<CalendarToday fontSize={"small"} />}>
                            <AlertTitle>Ingen timer planlagt</AlertTitle>
                            Trykk på <EventRepeat fontSize={"small"} sx={{ mb: -0.5 }} /> -ikonet i oversikten for å
                            legge til en time i timeplanen.
                        </Alert>
                    )}
                    <AgendaDays dayMap={plannedClassesDayMap} />
                </Box>
            )}
        </Box>
    );
}
