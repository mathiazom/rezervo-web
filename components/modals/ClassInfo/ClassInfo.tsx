import { Box, Typography } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { simpleTimeStringFromISO, WEEKDAY_NUMBER_TO_NAME } from "../../../utils/timeUtils";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ClassPopularityMeter from "../../ClassCard/ClassPopularityMeter";
import Image from "next/image";
import React, { useState } from "react";
import { SitClass } from "../../../types/sitTypes";
import { hexWithOpacityToRgb } from "../../../utils/colorUtils";
import { DateTime } from "luxon";
import { SIT_TIMEZONE } from "../../../config/config";
import { formatNameArray } from "../../../utils/arrayUtils";
import { ClassPopularity, SessionStatus, StatusColors, UserNameWithIsSelf } from "../../../types/rezervoTypes";
import { stringifyClassPopularity } from "../../../lib/popularity";
import ClassUsersAvatarGroup from "../../ClassUsersAvatarGroup";
import LoadingButton from "@mui/lab/LoadingButton";
import ConfirmationDialog from "../../ConfirmationDialog";
import { useUserSessions } from "../../../hooks/useUserSessions";

export default function ClassInfo({
    _class,
    classPopularity,
    configUsers,
}: {
    _class: SitClass;
    classPopularity: ClassPopularity;
    configUsers: UserNameWithIsSelf[];
}) {
    const { userSessionsIndex, mutateSessionsIndex } = useUserSessions();
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const color = (dark: boolean) => `rgb(${hexWithOpacityToRgb(_class.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = DateTime.fromISO(_class.from, { zone: SIT_TIMEZONE }) < DateTime.now();

    const usersBooked = userSessions.filter(
        ({ status }) => status === SessionStatus.CONFIRMED || status === SessionStatus.BOOKED
    );

    const selfBooked = usersBooked.some((u) => u.is_self);

    const usersOnWaitlist = userSessions.filter(({ status }) => status === SessionStatus.WAITLIST);

    const selfOnWaitlist = usersOnWaitlist.some((u) => u.is_self);

    const usersPlanned = configUsers.filter(
        ({ user_name }) => !userSessions.map((u) => u.user_name).includes(user_name)
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
                    {_class.name}
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
                    {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
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
                    {_class.studio.name}
                    {_class.room && _class.room.length > 0 ? `, ${_class.room}` : ""}
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
                    <ClassUsersAvatarGroup users={usersPlanned.map((u) => u.user_name)} alert={_class.bookable} />
                    <Typography variant="body2" color="text.secondary">
                        {`${formatNameArray(
                            usersPlanned.filter((u) => !u.is_self).map((u) => u.user_name),
                            4,
                            usersPlanned.some((u) => u.is_self)
                        )} ${
                            _class.bookable ? "har planlagt denne timen, men ikke booket plass!" : "skal på denne timen"
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
                            usersOnWaitlist.some((u) => u.is_self)
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
                            selfBooked
                        )} ${isInThePast ? "var på denne timen" : "har booket denne timen"}`}
                    </Typography>
                </Box>
            )}
            {_class.image && (
                <Box pt={2}>
                    <Image
                        src={_class.image}
                        alt={_class.name}
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
            <Typography pt={2}>{_class.description}</Typography>
            {!isInThePast &&
                _class.bookable &&
                (selfBooked || selfOnWaitlist ? (
                    <LoadingButton
                        sx={{ mt: 2 }}
                        variant={"outlined"}
                        color={"error"}
                        disabled={isInThePast || !_class.bookable}
                        onClick={() => setCancelBookingConfirmationOpen(true)}
                        loading={bookingLoading}
                    >
                        Avbestill
                    </LoadingButton>
                ) : (
                    <LoadingButton
                        sx={{ mt: 2 }}
                        variant={"outlined"}
                        disabled={isInThePast || !_class.bookable}
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
                        <Typography>{`Du er i ferd med å avbestille ${_class.name} (${
                            _class.weekday ? `${WEEKDAY_NUMBER_TO_NAME.get(_class.weekday)}, ` : ""
                        }${simpleTimeStringFromISO(_class.from)}).`}</Typography>
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