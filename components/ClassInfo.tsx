import { Box, Typography } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { simpleTimeStringFromISO } from "../utils/timeUtils";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ClassPopularityMeter from "./ClassCard/ClassPopularityMeter";
import Image from "next/image";
import React from "react";
import { SitClass } from "../types/sitTypes";
import { hexWithOpacityToRgb } from "../utils/colorUtils";
import { DateTime } from "luxon";
import { SIT_TIMEZONE } from "../config/config";
import { formatNameArray } from "../utils/arrayUtils";
import { ClassPopularity, SessionStatus, UserNameSessionStatus } from "../types/rezervoTypes";
import { UsersAvatarGroup } from "./UsersAvatarGroup";

export default function ClassInfo({
    _class,
    classPopularity,
    peers,
    userSessions,
}: {
    _class: SitClass;
    classPopularity: ClassPopularity;
    peers: string[];
    userSessions: UserNameSessionStatus[];
}) {
    const color = (dark: boolean) => `rgb(${hexWithOpacityToRgb(_class.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = DateTime.fromISO(_class.from, { zone: SIT_TIMEZONE }) < DateTime.now();

    const usersBooked = userSessions.filter(
        ({ status }) => status === SessionStatus.CONFIRMED || status === SessionStatus.BOOKED
    );

    const usersOnWaitlist = userSessions.filter(({ status }) => status === SessionStatus.WAITLIST);

    const usersPlanned = peers.filter((p) => !userSessions.map((u) => u.user_name).includes(p));

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
            {!isInThePast && (
                <Box
                    sx={{
                        display: "flex",
                        paddingTop: 1,
                        gap: 1,
                        alignItems: "center",
                    }}
                >
                    <ClassPopularityMeter popularity={classPopularity} />
                    <Typography variant="body2" color="text.secondary">
                        {classPopularity}
                    </Typography>
                </Box>
            )}
            {!isInThePast && usersPlanned.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                    <UsersAvatarGroup users={usersPlanned} />
                    <Typography variant="body2" color="text.secondary">
                        {`${formatNameArray(usersPlanned, 4)} skal på denne timen`}
                    </Typography>
                </Box>
            )}
            {!isInThePast && usersOnWaitlist.length > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                    <UsersAvatarGroup
                        users={usersOnWaitlist.map((u) => u.user_name)}
                        badgeColor={"#b75f00"}
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
                    <UsersAvatarGroup
                        users={usersBooked.map((u) => u.user_name)}
                        badgeColor={"#44b700"}
                        invisibleBadges={isInThePast}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {`${formatNameArray(
                            usersBooked.filter((u) => !u.is_self).map((u) => u.user_name),
                            4,
                            usersBooked.some((u) => u.is_self)
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
        </Box>
    );
}
