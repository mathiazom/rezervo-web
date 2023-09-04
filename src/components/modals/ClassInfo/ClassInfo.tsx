import { useUser } from "@auth0/nextjs-auth0/client";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";

import ClassPopularityMeter from "@/components/schedule/class/ClassPopularityMeter";
import ClassUsersAvatarGroup from "@/components/schedule/class/ClassUsersAvatarGroup";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { getCapitalizedWeekday, isClassInThePast } from "@/lib/integration/common";
import { stringifyClassPopularity } from "@/lib/popularity";
import { formatNameArray } from "@/lib/utils/arrayUtils";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { ClassPopularity, RezervoClass, SessionStatus, StatusColors, UserNameWithIsSelf } from "@/types/rezervo";

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
    const { userConfig, userConfigLoading, userConfigError } = useUserConfig(_class.integration);
    const { userSessionsIndex, mutateSessionsIndex } = useUserSessions(_class.integration);
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

    const [bookingLoading, setBookingLoading] = useState(false);

    const [cancelBookingConfirmationOpen, setCancelBookingConfirmationOpen] = useState(false);

    async function book() {
        setBookingLoading(true);
        await fetch(`/api/${_class.integration}/book`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        setBookingLoading(false);
    }

    async function cancelBooking() {
        setBookingLoading(true);
        await fetch(`/api/${_class.integration}/cancel-booking`, {
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
                    {_class.startTime.toFormat("HH:mm")} - {_class.endTime.toFormat("HH:mm")}
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
                    {_class.instructors.join(", ")}
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
                        style={{
                            maxWidth: "100%",
                            objectFit: "cover",
                            borderRadius: "0.25em",
                            padding: 0,
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
                        <Typography>{`Du er i ferd med å avbestille ${_class.activity.name} (${getCapitalizedWeekday(
                            _class.startTime,
                        )}, ${_class.startTime.toFormat("HH:mm")}.`}</Typography>
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
