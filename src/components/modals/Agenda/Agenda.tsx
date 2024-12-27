import {
    CalendarMonth,
    CalendarToday,
    EventRepeat,
    InfoOutlined,
    PauseCircleRounded,
    SettingsRounded,
} from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";

import AgendaEntry from "@/components/modals/Agenda/AgendaSession";
import ModalWrapper from "@/components/modals/ModalWrapper";
import SubHeader from "@/components/modals/SubHeader";
import { PLANNED_SESSIONS_NEXT_WHOLE_WEEKS } from "@/lib/consts";
import { capitalizeFirstCharacter, isClassInThePast } from "@/lib/helpers/date";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { formatNameArray } from "@/lib/utils/arrayUtils";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig, ClassConfig } from "@/types/config";
import { SessionStatus, BaseUserSession } from "@/types/userSessions";

function mapClassesByStartTime(classes: BaseUserSession[]): Record<string, BaseUserSession[]> {
    return classes.reduce<Record<string, BaseUserSession[]>>((acc, next) => {
        const prettyStartTime = capitalizeFirstCharacter(next.classData.startTime.toFormat("cccc d. LLLL") ?? "");
        return {
            ...acc,
            [prettyStartTime]: [...(acc[prettyStartTime] ?? []), next],
        };
    }, {});
}

function AgendaDays({ dayMap }: { dayMap: Record<string, BaseUserSession[]> }) {
    const theme = useTheme();
    return (
        <>
            {Object.keys(dayMap).map((prettyDate) => (
                <Box key={prettyDate}>
                    <Typography
                        variant="h6"
                        style={{
                            color: theme.palette.grey[600],
                            fontSize: 15,
                        }}
                        sx={{
                            mb: 0.5,
                        }}
                    >
                        {prettyDate}
                    </Typography>
                    {dayMap[prettyDate]!.map((userSession) => (
                        <Box
                            key={userSession.classData.id}
                            sx={{
                                py: 0.5,
                            }}
                        >
                            <AgendaEntry userSession={userSession} chain={userSession.chain} />
                        </Box>
                    ))}
                </Box>
            ))}
        </>
    );
}

function searchForGhosts(
    userSessions: BaseUserSession[],
    chainConfigs: Record<ChainIdentifier, ChainConfig>,
): Record<ChainIdentifier, ClassConfig[]> {
    const classRecurrentIds = userSessions.map((_class) => classRecurrentId(_class.classData));
    return Object.entries(chainConfigs).reduce<Record<ChainIdentifier, ClassConfig[]>>(
        (acc, [chainIdentifier, config]) => {
            if (!config.active) {
                return acc;
            }

            const ghostClasses = config.recurringBookings.filter(
                (classConfig) => !classRecurrentIds.includes(classConfigRecurrentId(classConfig)),
            );

            if (ghostClasses.length > 0) {
                acc[chainIdentifier] = ghostClasses;
            }

            return acc;
        },
        {},
    );
}

export default function Agenda({
    userSessions,
    chainConfigs,
    chainProfiles,
}: {
    userSessions: BaseUserSession[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    chainProfiles: ChainProfile[];
}) {
    const theme = useTheme();
    const plannedSessionsDayMap = mapClassesByStartTime(
        userSessions.filter((_class) => _class.status === SessionStatus.PLANNED),
    );
    const bookedSessionsDayMap = mapClassesByStartTime(
        userSessions.filter(
            (_class) =>
                !isClassInThePast(_class.classData) &&
                (_class.status === SessionStatus.WAITLIST || _class.status === SessionStatus.BOOKED),
        ),
    );
    const missingClassConfigs = searchForGhosts(userSessions, chainConfigs);
    const inactiveChains = Object.keys(chainConfigs).filter((chain) => !chainConfigs[chain]?.active);

    return (
        <ModalWrapper title={"Agenda"} icon={userSessions.length > 0 ? <CalendarMonth /> : <CalendarToday />}>
            {Object.keys(chainConfigs).length === 0 ? (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                    <AlertTitle>Mangler medlemskap</AlertTitle>
                    Du må koble til et treningsmedlemskap for å kunne se bookinger og planlagte timer. Trykk på{" "}
                    <SettingsRounded fontSize={"small"} sx={{ mb: -0.6 }} /> Innstillinger for å komme i gang.
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
                            <SubHeader title={"Utdaterte timer"} />
                            {Object.entries(missingClassConfigs).flatMap(([chain, classConfigs]) =>
                                classConfigs.map((classConfig) => (
                                    <AgendaEntry
                                        key={classConfigRecurrentId(classConfig)}
                                        classConfig={classConfig}
                                        chain={chain}
                                    />
                                )),
                            )}
                        </Box>
                    )}
                    <SubHeader
                        title={"Mine bookinger"}
                        placeholder={"Du har ingen bookinger"}
                        showPlaceholder={Object.keys(bookedSessionsDayMap).length === 0}
                    />
                    <AgendaDays dayMap={bookedSessionsDayMap} />
                    <Box height={2} />
                    <SubHeader title={"Planlagte timer"} description={"Disse timene vil bli booket automatisk"} />
                    {inactiveChains.length > 0 &&
                        (inactiveChains.length === Object.keys(chainConfigs).length ? (
                            <Alert severity={"info"} icon={<PauseCircleRounded />}>
                                <AlertTitle>Automatisk booking er satt på pause</AlertTitle>
                                Du kan skru på automatisk booking i{" "}
                                <SettingsRounded fontSize={"small"} sx={{ mb: -0.6 }} /> Innstillinger, slik at timene i
                                timeplanen blir booket automatisk
                            </Alert>
                        ) : (
                            <Alert severity={"info"} icon={<PauseCircleRounded />}>
                                <AlertTitle>Automatisk booking er delvis pauset</AlertTitle>
                                Booking er pauset for{" "}
                                <b>
                                    {formatNameArray(
                                        chainProfiles
                                            .filter((cp) => inactiveChains.includes(cp.identifier))
                                            .map((cp) => cp.name),
                                    )}
                                </b>
                                . Du kan skru på automatisk booking i{" "}
                                <SettingsRounded fontSize={"small"} sx={{ mb: -0.6 }} /> Innstillinger, slik at timene i
                                timeplanen blir booket automatisk
                            </Alert>
                        ))}
                    {Object.values(plannedSessionsDayMap).length === 0 && inactiveChains.length === 0 && (
                        <Alert severity={"info"} icon={<CalendarToday fontSize={"small"} />}>
                            <AlertTitle>Ingen timer planlagt</AlertTitle>
                            Trykk på <EventRepeat fontSize={"small"} sx={{ mb: -0.5 }} /> -ikonet i oversikten for å
                            legge til en time i timeplanen.
                        </Alert>
                    )}
                    <AgendaDays dayMap={plannedSessionsDayMap} />
                    <Stack
                        direction={"row"}
                        sx={{
                            alignItems: "center",
                            mt: 4,
                            mb: 2,
                            pl: 1,
                            pr: 3,
                            gap: 2,
                        }}
                    >
                        <InfoOutlined sx={{ color: theme.palette.grey[500] }} />
                        <Typography
                            variant="body2"
                            style={{
                                color: theme.palette.grey[500],
                                fontSize: 14,
                            }}
                        >
                            {PLANNED_SESSIONS_NEXT_WHOLE_WEEKS > 1
                                ? `Viser planlagte bookinger kun for de neste\u00A0${PLANNED_SESSIONS_NEXT_WHOLE_WEEKS}\u00A0ukene`
                                : `Viser planlagte bookinger kun til og med neste\u00A0uke`}
                        </Typography>
                    </Stack>
                </Box>
            )}
        </ModalWrapper>
    );
}
