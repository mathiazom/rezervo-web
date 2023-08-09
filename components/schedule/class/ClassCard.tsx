import { Avatar, AvatarGroup, Box, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SitClass } from "../../../types/integration/sit";
import { simpleTimeStringFromISO } from "../../../utils/timeUtils";
import { hexColorHash, hexWithOpacityToRgb } from "../../../utils/colorUtils";
import { EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS } from "../../../types/animationTypes";
import { randomElementFromArray } from "../../../utils/arrayUtils";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ClassPopularityMeter from "./ClassPopularityMeter";
import { ClassPopularity, SessionStatus, StatusColors, UserNameWithIsSelf } from "../../../types/rezervoTypes";
import RippleBadge from "../../utils/RippleBadge";
import { isClassInThePast } from "../../../lib/iBooking";
import ClassUserAvatar from "./ClassUserAvatar";
import { useUserSessions } from "../../../hooks/useUserSessions";

const ClassCard = ({
    _class,
    popularity,
    configUsers,
    selectable,
    selected,
    onSelectedChanged,
    onInfo,
}: // onSettings,
{
    _class: SitClass;
    popularity: ClassPopularity;
    configUsers: UserNameWithIsSelf[];
    selectable: boolean;
    selected: boolean;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (selected: boolean) => void;
    onInfo: () => void;
    // onSettings: () => void;
}) => {
    const { userSessionsIndex } = useUserSessions();
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(
        selected ? randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null : null
    );

    useEffect(() => {
        if (selected) {
            setSelectAnimation(randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null);
        }
    }, [selected]);

    function handleClick() {
        onSelectedChanged(!selected);
    }

    const classColorRGB = (dark: boolean) => `rgb(${hexWithOpacityToRgb(_class.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = isClassInThePast(_class);

    const showSelected = !isInThePast && selected;

    const usersPlanned = configUsers.filter(
        ({ user_name }) => !userSessions.map((u) => u.user_name).includes(user_name)
    );

    return (
        <Card
            sx={{
                opacity: isInThePast ? 0.6 : 1,
                background: "none",
                position: "relative",
                borderLeft: `0.4rem solid ${classColorRGB(false)}`,
                '[data-mui-color-scheme="dark"] &': {
                    borderLeft: `0.4rem solid ${classColorRGB(true)}`,
                },
            }}
        >
            <CardContent
                className={"unselectable"}
                onClick={selectable && !isInThePast ? handleClick : undefined}
                sx={{ paddingBottom: 1 }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography
                        sx={{
                            textDecoration: isInThePast ? "line-through" : "none",
                            fontSize: "1.05rem",
                            ...(showSelected ? { fontWeight: "bold" } : {}),
                        }}
                    >
                        {_class.name}
                    </Typography>
                    <ClassPopularityMeter _class={_class} historicPopularity={popularity} />
                </Box>
                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                    {simpleTimeStringFromISO(_class.from)} - {simpleTimeStringFromISO(_class.to)}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                    {_class.studio.name}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                    {_class.instructors.map((i) => i.name).join(", ")}
                </Typography>
            </CardContent>
            <CardActions sx={{ padding: 0 }} disableSpacing>
                <Box px={1.75} pt={0.5} pb={2} sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex" }}>
                        <IconButton onClick={onInfo} size={"small"} sx={{ padding: 0 }}>
                            <InfoOutlinedIcon />
                        </IconButton>
                        {/*{selected && (*/}
                        {/*    <IconButton onClick={onSettings} size={"small"}>*/}
                        {/*        <SettingsOutlinedIcon />*/}
                        {/*    </IconButton>*/}
                        {/*)}*/}
                        {(userSessions.length > 0 || (!isInThePast && usersPlanned.length > 0)) && (
                            <AvatarGroup
                                max={4}
                                sx={{
                                    justifyContent: "start",
                                    marginLeft: "auto",
                                    "& .MuiAvatar-root": {
                                        width: 24,
                                        height: 24,
                                        fontSize: 12,
                                        borderColor: "white",
                                        '[data-mui-color-scheme="dark"] &': {
                                            borderColor: "#191919",
                                        },
                                    },
                                }}
                            >
                                {!isInThePast &&
                                    usersPlanned.length > 0 &&
                                    usersPlanned.map(({ user_name }) => (
                                        <ClassUserAvatar key={user_name} username={user_name} alert={_class.bookable} />
                                    ))}
                                {userSessions.length > 0 &&
                                    userSessions.map(({ user_name, status }) => {
                                        const rippleColor =
                                            status === SessionStatus.BOOKED || status === SessionStatus.CONFIRMED
                                                ? StatusColors.ACTIVE
                                                : StatusColors.WAITLIST;
                                        return (
                                            <RippleBadge
                                                key={user_name}
                                                invisible={isInThePast}
                                                overlap="circular"
                                                anchorOrigin={{
                                                    vertical: "bottom",
                                                    horizontal: "right",
                                                }}
                                                variant={"dot"}
                                                rippleColor={rippleColor}
                                            >
                                                <Avatar
                                                    alt={user_name}
                                                    sx={{
                                                        backgroundColor: hexColorHash(user_name),
                                                    }}
                                                >
                                                    {user_name[0]}
                                                </Avatar>
                                            </RippleBadge>
                                        );
                                    })}
                            </AvatarGroup>
                        )}
                    </Box>
                </Box>
            </CardActions>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    zIndex: -1,
                    backgroundColor: "white",
                    '[data-mui-color-scheme="dark"] &': {
                        backgroundColor: "#191919",
                    },
                }}
            />
            {selectAnimation && (
                <Box
                    className={selectAnimation ? (showSelected ? selectAnimation.enter : selectAnimation.leave) : ""}
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        width: "100%",
                        zIndex: -1,
                        backgroundColor: classColorRGB(false),
                        '[data-mui-color-scheme="dark"] &': {
                            backgroundColor: classColorRGB(true),
                        },
                    }}
                />
            )}
        </Card>
    );
};

export default ClassCard;
