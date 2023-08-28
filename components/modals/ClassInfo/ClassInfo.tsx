import { useUser } from "@auth0/nextjs-auth0/client";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Typography } from "@mui/material";
import { DateTime } from "luxon";
import Image from "next/image";
import React, { useState } from "react";

import { TIME_ZONE } from "../../../config/config";
import { useUserSessions } from "../../../hooks/useUserSessions";
import { stringifyClassPopularity } from "../../../lib/popularity";
import { ClassPopularity, RezervoClass, SessionStatus, StatusColors, UserNameWithIsSelf } from "../../../types/rezervo";
import { formatNameArray } from "../../../utils/arrayUtils";
import { hexWithOpacityToRgb } from "../../../utils/colorUtils";
import { simpleTimeStringFromISO, WEEKDAY_NUMBER_TO_NAME } from "../../../utils/timeUtils";
import ClassPopularityMeter from "../../schedule/class/ClassPopularityMeter";
import ClassUsersAvatarGroup from "../../schedule/class/ClassUsersAvatarGroup";
import ConfirmationDialog from "../../utils/ConfirmationDialog";

export default function ClassInfo({
    _class,
    classPopularity,
    configUsers,
}: {
    _class: RezervoClass;
    classPopularity: ClassPopularity;
    configUsers: UserNameWithIsSelf[];
}) {
    const { user } = useUser();
    const { userSessionsIndex, mutateSessionsIndex } = useUserSessions();
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const color = (dark: boolean) =>
        `rgb(${hexWithOpacityToRgb(_class.activity.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = DateTime.fromISO(_class.startTimeISO, { zone: TIME_ZONE }) < DateTime.now();

    const usersBooked = userSessions.filter(
        ({ status }) => status === SessionStatus.CONFIRMED || status === SessionStatus.BOOKED,
    );

    const selfBooked = usersBooked.some((u) => u.is_self);

    const usersOnWaitlist = userSessions.filter(({ status }) => status === SessionStatus.WAITLIST);

    const selfOnWaitlist = usersOnWaitlist.some((u) => u.is_self);

    const usersPlanned = configUsers.filter(
        ({ user_name }) => !userSessions.map((u) => u.user_name).includes(user_name),
    );

    const [bookingLoading, setBookingLoading] = useState(false);

    const [cancelBookingConfirmationOpen, setCancelBookingConfirmationOpen] = useState(false);

    async function book() {
        setBookingLoading(true);
        await fetch("/api/book", {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
    }

    async function cancelBooking() {
        setBookingLoading(true);
        await fetch("/api/cancelBooking", {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
    }

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "95%",
                maxHeight: "80%",
                overflowY: "scroll",
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
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <AccessTimeRoundedIcon />
                <Typography variant="body2" color="text.secondary">
                    {simpleTimeStringFromISO(_class.startTimeISO)} - {simpleTimeStringFromISO(_class.endTimeISO)}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <LocationOnRoundedIcon />
                <Typography variant="body2" color="text.secondary">
                    {_class.location.studio}
                    {_class.location.room && _class.location.room.length > 0 ? `, ${_class.location.room}` : ""}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <PersonRoundedIcon />
                <Typography variant="body2" color="text.secondary">
                    {_class.instructors.map((i) => i.name).join(", ")}
                </Typography>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                }}
            >
                <ClassPopularityMeter _class={_class} historicPopularity={classPopularity} />
                <Typography variant="body2" color="text.secondary">
                    {stringifyClassPopularity(_class, classPopularity)}
                </Typography>
            </Box>
            {!isInThePast && usersPlanned.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                    <ClassUsersAvatarGroup users={usersPlanned.map((u) => u.user_name)} alert={_class.isBookable} />
                    <Typography variant="body2" color="text.secondary">
                        {`${formatNameArray(
                            usersPlanned.filter((u) => !u.is_self).map((u) => u.user_name),
                            4,
                            usersPlanned.some((u) => u.is_self),
                        )} ${
                            _class.isBookable
                                ? "har planlagt denne timen, men ikke booket plass!"
                                : "skal på denne timen"
                        }`}
                    </Typography>
                </Box>
            )}
            {!isInThePast && usersOnWaitlist.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
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
                        )} er på venteliste for denne timen`}
                    </Typography>
                </Box>
            )}
            {usersBooked.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
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
                        )} ${isInThePast ? "var på denne timen" : "har booket denne timen"}`}
                    </Typography>
                </Box>
            )}
            {_class.activity.image && (
                <Box pt={2}>
                    <Image
                        src={_class.activity.image}
                        alt={_class.activity.name}
                        width={600}
                        height={300}
                        objectFit={"cover"}
                        style={{
                            borderRadius: "0.25em",
                            padding: 0,
                        }}
                    ></Image>
                </Box>
            )}
            <Typography pt={2}>{_class.activity.description}</Typography>
            {user &&
                !isInThePast &&
                _class.isBookable &&
                (selfBooked || selfOnWaitlist ? (
                    <LoadingButton
                        sx={{ mt: 2 }}
                        variant={"outlined"}
                        color={"error"}
                        disabled={isInThePast || !_class.isBookable}
                        onClick={() => setCancelBookingConfirmationOpen(true)}
                        loading={bookingLoading}
                    >
                        Avbestill
                    </LoadingButton>
                ) : (
                    <LoadingButton
                        sx={{ mt: 2 }}
                        variant={"outlined"}
                        disabled={isInThePast || !_class.isBookable}
                        onClick={() => book()}
                        loading={bookingLoading}
                    >
                        Book nå
                    </LoadingButton>
                ))}
            <ConfirmationDialog
                open={cancelBookingConfirmationOpen}
                title={`Avbestille time?`}
                description={
                    <>
                        <Typography>{`Du er i ferd med å avbestille ${_class.activity.name} (${
                            _class.weekday ? `${WEEKDAY_NUMBER_TO_NAME.get(_class.weekday)}, ` : ""
                        }${simpleTimeStringFromISO(_class.startTimeISO)}).`}</Typography>
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
