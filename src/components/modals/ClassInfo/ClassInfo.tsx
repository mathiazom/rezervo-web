import { useUser } from "@auth0/nextjs-auth0/client";
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
    RocketLaunch,
} from "@mui/icons-material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Image from "next/image";
import React, { useState } from "react";

import ClassPopularityMeter from "@/components/schedule/class/ClassPopularityMeter";
import ClassUsersAvatarGroup from "@/components/schedule/class/ClassUsersAvatarGroup";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { ChainIdentifier } from "@/lib/activeChains";
import { isClassInThePast } from "@/lib/helpers/date";
import { stringifyClassPopularity } from "@/lib/helpers/popularity";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { formatNameArray } from "@/lib/utils/arrayUtils";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { RezervoClass } from "@/types/chain";
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
    const { user } = useUser();
    const { userConfig, userConfigLoading, userConfigError, allConfigsIndex } = useUserConfig(chain);
    const configUsers = allConfigsIndex ? allConfigsIndex[classRecurrentId(_class)] ?? [] : [];
    const { userSessionsIndex, userSessionsIndexLoading, userSessionsIndexError, mutateSessionsIndex } =
        useUserSessions(chain);
    const userSessionsLoading = userSessionsIndexLoading || userSessionsIndexError;
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const color = (dark: boolean) =>
        `rgb(${hexWithOpacityToRgb(_class.activity.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = isClassInThePast(_class);

    const usersBooked = userSessions.filter(
        ({ status }) => status === SessionStatus.CONFIRMED || status === SessionStatus.BOOKED,
    );

    const selfBooked = usersBooked.some((u) => u.is_self);

    const usersOnWaitlist = userSessions.filter(({ status }) => status === SessionStatus.WAITLIST);

    const selfOnWaitlist = usersOnWaitlist.some((u) => u.is_self);

    const usersPlanned = configUsers.filter(
        ({ user_name }) => !userSessions.map((u) => u.user_name).includes(user_name),
    );

    const classInUserConfig = userConfig?.recurringBookings
        ?.map(classConfigRecurrentId)
        .includes(classRecurrentId(_class));

    const [bookingLoading, setBookingLoading] = useState(false);

    const [cancelBookingConfirmationOpen, setCancelBookingConfirmationOpen] = useState(false);

    const classDescription = _class
        ? `${_class.activity.name} (${_class.startTime.weekdayLong}, ${_class.startTime.toFormat("HH:mm")})`
        : "";

    async function book() {
        setBookingLoading(true);
        await fetch(`/api/${chain}/book`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
    }

    async function cancelBooking() {
        setBookingLoading(true);
        await fetch(`/api/${chain}/cancel-booking`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
    }

    const cancelledOpacity = 0.5;

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
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
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
                {/*{selectedClassIds.includes(*/}
                {/*    modalClass.id.toString()*/}
                {/*) && (*/}
                {/*    <IconButton*/}
                {/*        onClick={() => {*/}
                {/*            setModalClass(null);*/}
                {/*            setSettingsClass(modalClass);*/}
                {/*        }}*/}
                {/*        size={"small"}*/}
                {/*    >*/}
                {/*        <SettingsOutlinedIcon />*/}
                {/*    </IconButton>*/}
                {/*)}*/}
            </Box>
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
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                    opacity: _class.isCancelled ? cancelledOpacity : 1,
                }}
            >
                <CalendarMonthIcon />
                <Typography variant="body2" color="text.secondary">
                    {_class.startTime.toFormat("EEEE d. LLLL")}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                    opacity: _class.isCancelled ? cancelledOpacity : 1,
                }}
            >
                <AccessTimeRoundedIcon />
                <Typography variant="body2" color="text.secondary">
                    {_class.startTime.toFormat("HH:mm")}–{_class.endTime.toFormat("HH:mm")}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                    opacity: _class.isCancelled ? cancelledOpacity : 1,
                }}
            >
                <LocationOnRoundedIcon />
                <Typography variant="body2" color="text.secondary">
                    {_class.location.studio}
                    {_class.location.room && _class.location.room.length > 0 ? `, ${_class.location.room}` : ""}
                </Typography>
            </Box>
            {_class.instructors.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        paddingTop: 1,
                        gap: 1,
                        alignItems: "center",
                        opacity: _class.isCancelled ? cancelledOpacity : 1,
                    }}
                >
                    <PersonRoundedIcon />
                    <Typography variant="body2" color="text.secondary">
                        {_class.instructors.map((i) => i.name).join(", ")}
                    </Typography>
                </Box>
            )}
            {((!_class.isBookable && !isInThePast) || _class.isCancelled) && (
                <Box
                    sx={{
                        display: "flex",
                        paddingTop: 1,
                        gap: 1,
                        alignItems: "center",
                        opacity: _class.isCancelled ? cancelledOpacity : 1,
                    }}
                >
                    <Diversity3Rounded />
                    <Typography variant="body2" color="text.secondary">
                        {_class.totalSlots} plasser
                    </Typography>
                </Box>
            )}
            {!_class.isCancelled && (
                <Box
                    sx={{
                        display: "flex",
                        paddingTop: 1,
                        gap: 1,
                        alignItems: "center",
                        opacity: _class.isCancelled ? cancelledOpacity : 1,
                    }}
                >
                    <ClassPopularityMeter _class={_class} historicPopularity={classPopularity} />
                    <Typography variant="body2" color="text.secondary">
                        {stringifyClassPopularity(_class, classPopularity)}
                    </Typography>
                </Box>
            )}
            {!isInThePast && usersPlanned.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
                    <ClassUsersAvatarGroup
                        users={usersPlanned.map((u) => u.user_name)}
                        alert={_class.isBookable}
                        loading={userSessionsLoading}
                    />
                    <Typography variant="body2" color={userSessionsLoading ? "text.disabled" : "text.secondary"}>
                        {userSessionsLoading
                            ? "henter bookingstatus ..."
                            : `${formatNameArray(
                                  usersPlanned.filter((u) => !u.is_self).map((u) => u.user_name),
                                  4,
                                  usersPlanned.some((u) => u.is_self),
                              )} ${
                                  _class.isBookable
                                      ? "har planlagt denne timen, men ikke booket plass!"
                                      : _class.isCancelled
                                      ? "skulle på denne timen"
                                      : "skal på denne timen"
                              }`}
                    </Typography>
                </Box>
            )}
            {!isInThePast && usersOnWaitlist.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        mt: 1.5,
                        opacity: _class.isCancelled ? cancelledOpacity : 1,
                    }}
                >
                    <ClassUsersAvatarGroup
                        users={usersOnWaitlist.map((u) => u.user_name)}
                        rippleColor={StatusColors.WAITLIST}
                        invisibleBadges={isInThePast}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {`${formatNameArray(
                            usersOnWaitlist.filter((u) => !u.is_self).map((u) => u.user_name),
                            4,
                            usersOnWaitlist.some((u) => u.is_self),
                        )} ${
                            _class.isCancelled
                                ? "var på venteliste for denne timen"
                                : "er på venteliste for denne timen"
                        }`}
                    </Typography>
                </Box>
            )}
            {usersBooked.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        mt: 1.5,
                        opacity: _class.isCancelled ? cancelledOpacity : 1,
                    }}
                >
                    <ClassUsersAvatarGroup
                        users={usersBooked.map((u) => u.user_name)}
                        rippleColor={StatusColors.ACTIVE}
                        invisibleBadges={isInThePast}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {`${formatNameArray(
                            usersBooked.filter((u) => !u.is_self).map((u) => u.user_name),
                            4,
                            selfBooked,
                        )} ${
                            _class.isCancelled
                                ? "hadde booket denne timen"
                                : isInThePast
                                ? "var på denne timen"
                                : "har booket denne timen"
                        }`}
                    </Typography>
                </Box>
            )}
            {user === undefined && !isInThePast && (
                <Alert severity="info" sx={{ mt: 1.5 }} icon={<Login fontSize={"small"} />}>
                    Du må logge inn for å kunne booke eller legge til timer i timeplanen
                </Alert>
            )}
            {user !== undefined && userConfig === undefined && !isInThePast && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                    <AlertTitle>
                        Koble til <b>{chain.toUpperCase()}</b>-medlemskap
                    </AlertTitle>
                    Du må koble <b>{chain.toUpperCase()}</b>-medlemskapet til <b>rezervo</b> for å kunne booke eller
                    legge til timer i timeplanen. Trykk på rakettsymbolet{" "}
                    <RocketLaunch fontSize={"small"} sx={{ mb: -0.7 }} /> øverst til høyre for å koble til.
                </Alert>
            )}
            {_class.activity.additionalInformation && (
                <Alert sx={{ mt: 1.5 }} severity={"info"}>
                    {_class.activity.additionalInformation}
                </Alert>
            )}
            {_class.activity.image && (
                <Box pt={2}>
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
            <Typography pt={2}>{_class.activity.description}</Typography>
            {user &&
                userConfig != undefined &&
                !userConfigLoading &&
                !userConfigError &&
                !isInThePast &&
                !_class.isCancelled && (
                    <>
                        {selfBooked || selfOnWaitlist ? (
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
                                    startIcon={_class.availableSlots > 0 ? <Add /> : <HourglassTop />}
                                    color={_class.availableSlots > 0 ? "primary" : "warning"}
                                    sx={{ mt: 2, mr: 1 }}
                                    variant={"outlined"}
                                    disabled={isInThePast || !_class.isBookable}
                                    onClick={() => book()}
                                    loading={bookingLoading}
                                >
                                    {_class.availableSlots > 0 ? "Book nå" : "Sett meg på venteliste"}
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
            <ConfirmationDialog
                open={cancelBookingConfirmationOpen}
                title={`Avbestille time?`}
                description={
                    <>
                        <Typography>
                            Du er i ferd med å avbestille <b>{classDescription}</b>.
                        </Typography>
                        <Typography>Dette kan ikke angres!</Typography>
                    </>
                }
                confirmText={"Avbestill"}
                onCancel={() => setCancelBookingConfirmationOpen(false)}
                onConfirm={() => {
                    setCancelBookingConfirmationOpen(false);
                    cancelBooking();
                }}
            />
        </Box>
    );
}
