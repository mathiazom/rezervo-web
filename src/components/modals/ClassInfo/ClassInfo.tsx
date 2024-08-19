import {
    Add,
    CancelRounded,
    Clear,
    Diversity3Rounded,
    EventBusy,
    EventRepeat,
    HourglassTop,
    Login,
    PauseCircleRounded,
    SettingsRounded,
} from "@mui/icons-material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert, AlertTitle, Box, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Image from "next/image";
import React, { useState } from "react";

import ClassInfoEntry from "@/components/modals/ClassInfo/ClassInfoEntry";
import ClassInfoUsersGroup from "@/components/modals/ClassInfo/ClassInfoUsersGroup";
import ClassPopularityMeter from "@/components/schedule/class/ClassPopularityMeter";
import ConfirmCancellation from "@/components/schedule/class/ConfirmCancellation";
import { NoShowBadgeIcon } from "@/components/utils/NoShowBadgeIcon";
import { PlannedNotBookedBadgeIcon } from "@/components/utils/PlannedNotBookedBadgeIcon";
import { isClassInThePast } from "@/lib/helpers/date";
import { hasWaitingList, stringifyClassPopularity } from "@/lib/helpers/popularity";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { post } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { ChainIdentifier, RezervoClass } from "@/types/chain";
import { ClassPopularity } from "@/types/popularity";
import { SessionStatus, StatusColors } from "@/types/userSessions";

export default function ClassInfo({
    chain,
    _class,
    classPopularity,
    onUpdateConfig,
}: {
    chain: ChainIdentifier;
    _class: RezervoClass;
    classPopularity: ClassPopularity;
    onUpdateConfig: (classId: string, selected: boolean) => void;
}) {
    const { token, authStatus } = useUser();
    const { userConfig, userConfigLoading, userConfigError, allConfigsIndex } = useUserConfig(chain);
    const configUsers = allConfigsIndex ? (allConfigsIndex[classRecurrentId(_class)] ?? []) : [];
    const { userSessionsIndex, userSessionsIndexLoading, userSessionsIndexError, mutateSessionsIndex } =
        useUserSessionsIndex(chain);
    const { mutateUserSessions } = useUserSessions();
    const userSessionsLoading = userSessionsIndexLoading || userSessionsIndexError;
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const color = (dark: boolean) => hexWithOpacityToRgb(_class.activity.color, 0.6, dark ? 0 : 255);

    const isInThePast = isClassInThePast(_class);

    const usersBooked = userSessions.filter(
        ({ status }) => status === SessionStatus.CONFIRMED || status === SessionStatus.BOOKED,
    );
    const usersOnWaitlist = userSessions.filter(({ status }) => status === SessionStatus.WAITLIST);

    const selfBookedOrOnWaitlist = usersBooked.some((u) => u.isSelf) || usersOnWaitlist.some((u) => u.isSelf);

    const noShowUsers = userSessions.filter(({ status }) => status === SessionStatus.NOSHOW);

    const usersPlanned = configUsers.filter(({ userName }) => !userSessions.map((u) => u.userName).includes(userName));

    const classInUserConfig = userConfig?.recurringBookings
        ?.map(classConfigRecurrentId)
        .includes(classRecurrentId(_class));

    const [bookingLoading, setBookingLoading] = useState(false);

    const [cancelBookingConfirmationOpen, setCancelBookingConfirmationOpen] = useState(false);

    async function book() {
        if (token == null) return; // TODO: error handling
        setBookingLoading(true);
        await post(`${chain}/book`, {
            body: JSON.stringify({ classId: _class.id.toString() }, null, 2),
            mode: "client",
            accessToken: token,
        });
        await mutateSessionsIndex();
        await mutateUserSessions();
        setBookingLoading(false);
    }

    // We might not know their position in the wait list before the sessions are pulled, depending on provider implementation
    const positionedUsersInWaitList = usersOnWaitlist.filter((u) => u.positionInWaitList);

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "95%",
                maxHeight: "80%",
                overflowY: "auto",
                maxWidth: 600,
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
            <Stack
                direction={"row"}
                sx={{
                    gap: 1,
                    alignItems: "center",
                    paddingBottom: 1,
                }}
            >
                <Box
                    sx={{
                        borderRadius: "50%",
                        height: "1.5rem",
                        width: "1.5rem",
                        backgroundColor: color(false),
                        '[data-mui-color-scheme="dark"] &': {
                            backgroundColor: color(true),
                        },
                    }}
                />
                <Typography variant="h6" component="h2">
                    {_class.activity.name}
                </Typography>
            </Stack>
            {_class.isCancelled && (
                <Alert severity={"error"} icon={<CancelRounded />}>
                    {_class.cancelText ? (
                        <>
                            <AlertTitle>Timen {isInThePast ? "ble" : "er"} avlyst!</AlertTitle>
                            {_class.cancelText}
                        </>
                    ) : (
                        `Timen ${isInThePast ? "ble" : "er"} avlyst!`
                    )}
                </Alert>
            )}
            <ClassInfoEntry
                icon={<CalendarMonthIcon />}
                label={_class.startTime.toFormat("EEEE d. LLLL")}
                cancelled={_class.isCancelled}
            />
            <ClassInfoEntry
                icon={<AccessTimeRoundedIcon />}
                label={`${_class.startTime.toFormat("HH:mm")}–${_class.endTime.toFormat("HH:mm")}`}
                cancelled={_class.isCancelled}
            />
            <ClassInfoEntry
                icon={<LocationOnRoundedIcon />}
                label={`${_class.location.studio}${_class.location.room && _class.location.room.length > 0 ? `, ${_class.location.room}` : ""}`}
                cancelled={_class.isCancelled}
            />
            {_class.instructors.length > 0 && (
                <ClassInfoEntry
                    icon={<PersonRoundedIcon />}
                    label={_class.instructors.map((i) => i.name).join(", ")}
                    cancelled={_class.isCancelled}
                />
            )}
            {_class.totalSlots !== null && ((!_class.isBookable && !isInThePast) || _class.isCancelled) && (
                <ClassInfoEntry
                    icon={<Diversity3Rounded />}
                    label={`${_class.totalSlots} plasser`}
                    cancelled={_class.isCancelled}
                />
            )}
            {!_class.isCancelled && _class.totalSlots !== null && _class.availableSlots !== null && (
                <ClassInfoEntry
                    icon={<ClassPopularityMeter _class={_class} historicPopularity={classPopularity} />}
                    label={stringifyClassPopularity(_class, classPopularity) ?? ""}
                    cancelled={_class.isCancelled}
                />
            )}
            {!isInThePast && (
                <>
                    <ClassInfoUsersGroup
                        users={usersPlanned}
                        badgeIcon={_class.isBookable ? <PlannedNotBookedBadgeIcon /> : undefined}
                        loading={userSessionsLoading}
                        text={
                            _class.isBookable
                                ? "har planlagt denne timen, men ikke booket plass!"
                                : _class.isCancelled
                                  ? "skulle på denne timen"
                                  : "skal på denne timen"
                        }
                    />
                    <ClassInfoUsersGroup
                        users={usersOnWaitlist}
                        rippleColor={StatusColors.WAITLIST}
                        isCancelled={_class.isCancelled}
                        text={
                            _class.isCancelled
                                ? "var på venteliste for denne timen"
                                : "er på venteliste for denne timen" +
                                  (positionedUsersInWaitList.length > 0
                                      ? ` (${positionedUsersInWaitList
                                            .map(
                                                (u) =>
                                                    `${u.isSelf ? "din plassering" : u.userName}: ${u.positionInWaitList}.`,
                                            )
                                            .join(", ")})`
                                      : "")
                        }
                    />
                </>
            )}
            <ClassInfoUsersGroup
                users={usersBooked}
                rippleColor={StatusColors.ACTIVE}
                invisibleBadges={isInThePast}
                isCancelled={_class.isCancelled}
                text={
                    _class.isCancelled
                        ? "hadde booket denne timen"
                        : isInThePast
                          ? "var på denne timen"
                          : "har booket denne timen"
                }
            />
            <ClassInfoUsersGroup
                users={noShowUsers}
                badgeIcon={<NoShowBadgeIcon />}
                text={"booket plass, men møtte ikke opp!"}
            />
            {authStatus === "unauthenticated" && !isInThePast && (
                <Alert severity="info" sx={{ mt: 1.5 }} icon={<Login fontSize={"small"} />}>
                    Du må logge inn for å kunne booke eller legge til timer i timeplanen
                </Alert>
            )}
            {authStatus === "authenticated" && userConfig === undefined && !isInThePast && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                    <AlertTitle>
                        Koble til <b>{chain.toUpperCase()}</b>-medlemskap
                    </AlertTitle>
                    Du må koble <b>{chain.toUpperCase()}</b>-medlemskapet ditt til <b>rezervo</b> for å kunne booke
                    eller legge til timer i timeplanen. Trykk på{" "}
                    <SettingsRounded fontSize={"small"} sx={{ mb: -0.6 }} /> Innstillinger for å komme i gang.
                </Alert>
            )}
            {_class.activity.additionalInformation && (
                <Alert sx={{ mt: 1.5 }} severity={"info"}>
                    {_class.activity.additionalInformation}
                </Alert>
            )}
            {_class.activity.image && (
                <Box
                    sx={{
                        pt: 2,
                    }}
                >
                    <Image
                        src={_class.activity.image}
                        alt={_class.activity.name}
                        width={600}
                        height={300}
                        style={{
                            maxWidth: "100%",
                            objectFit: "cover",
                            borderRadius: "0.25em",
                            padding: 0,
                            ...(_class.isCancelled
                                ? {
                                      filter: "grayscale(1)",
                                  }
                                : {}),
                        }}
                    ></Image>
                </Box>
            )}
            <Typography
                sx={{
                    pt: 2,
                }}
            >
                {_class.activity.description}
            </Typography>
            {authStatus === "authenticated" &&
                userConfig != undefined &&
                !userConfigLoading &&
                !userConfigError &&
                !isInThePast &&
                !_class.isCancelled && (
                    <>
                        {selfBookedOrOnWaitlist ? (
                            <LoadingButton
                                startIcon={<Clear />}
                                sx={{ mt: 2, mr: 1 }}
                                variant={"outlined"}
                                color={"error"}
                                disabled={isInThePast || !_class.isBookable}
                                onClick={() => setCancelBookingConfirmationOpen(true)}
                                loading={bookingLoading}
                            >
                                Avbestill
                            </LoadingButton>
                        ) : (
                            !_class.isCancelled && (
                                <LoadingButton
                                    startIcon={hasWaitingList(_class) ? <HourglassTop /> : <Add />}
                                    color={hasWaitingList(_class) ? "warning" : "primary"}
                                    sx={{ mt: 2, mr: 1 }}
                                    variant={"outlined"}
                                    disabled={isInThePast || !_class.isBookable}
                                    onClick={() => book()}
                                    loading={bookingLoading}
                                >
                                    {hasWaitingList(_class) ? "Sett meg på venteliste" : "Book nå"}
                                </LoadingButton>
                            )
                        )}
                        {classInUserConfig ? (
                            <Button
                                sx={{ mt: 2 }}
                                variant={"outlined"}
                                color={"error"}
                                startIcon={<EventBusy />}
                                onClick={() => onUpdateConfig(classRecurrentId(_class), false)}
                            >
                                Fjern fra timeplan
                            </Button>
                        ) : (
                            <Button
                                sx={{ mt: 2 }}
                                variant={"outlined"}
                                startIcon={<EventRepeat />}
                                onClick={() => onUpdateConfig(classRecurrentId(_class), true)}
                            >
                                Legg til i timeplan
                            </Button>
                        )}
                        {!_class.isBookable &&
                            (userConfig?.active === false && classInUserConfig ? (
                                <Alert severity={"info"} sx={{ mt: 1 }} icon={<PauseCircleRounded />}>
                                    <AlertTitle>Automatisk booking er satt på pause</AlertTitle>
                                    Denne timen vil ikke bli booket automatisk. Du kan skru på automatisk booking i
                                    innstillinger, slik at timene i timeplanen blir booket automatisk
                                </Alert>
                            ) : (
                                !_class.isCancelled && (
                                    <Alert sx={{ mt: 1 }} severity="info">
                                        Booking for denne timen har ikke åpnet enda
                                        {classInUserConfig &&
                                            userConfig?.active &&
                                            ", men den vil bli booket automatisk når bookingen åpner"}
                                    </Alert>
                                )
                            ))}
                    </>
                )}
            <ConfirmCancellation
                open={cancelBookingConfirmationOpen}
                setOpen={setCancelBookingConfirmationOpen}
                setLoading={setBookingLoading}
                chain={chain}
                _class={_class}
            />
        </Box>
    );
}
