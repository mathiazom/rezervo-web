import { CancelRounded, EventBusy, EventRepeat } from "@mui/icons-material";
import { AvatarGroup, Badge, Box, Card, CardActions, CardContent, Tooltip, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { Fragment, useEffect, useState } from "react";

import ClassPopularityMeter from "@/components/schedule/class/ClassPopularityMeter";
import ClassUserAvatar from "@/components/schedule/class/ClassUserAvatar";
import { NoShowBadgeIcon } from "@/components/utils/NoShowBadgeIcon";
import { PlannedNotBookedBadgeIcon } from "@/components/utils/PlannedNotBookedBadgeIcon";
import { ChainIdentifier } from "@/lib/activeChains";
import { isClassInThePast } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { randomElementFromArray } from "@/lib/utils/arrayUtils";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS } from "@/types/animation";
import { RezervoClass } from "@/types/chain";
import { ClassPopularity } from "@/types/popularity";
import { SessionStatus, StatusColors } from "@/types/userSessions";

const ClassCard = ({
    chain,
    _class,
    popularity,
    selectable,
    selected,
    onUpdateConfig,
    onInfo,
}: {
    chain: ChainIdentifier;
    _class: RezervoClass;
    popularity: ClassPopularity;
    selectable: boolean;
    selected: boolean;
    onUpdateConfig: (selected: boolean) => void;
    onInfo: () => void;
}) => {
    const { userSessionsIndex, userSessionsIndexLoading, userSessionsIndexError } = useUserSessions(chain);
    const userSessionsLoading = userSessionsIndexLoading || userSessionsIndexError;
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const { allConfigsIndex } = useUserConfig(chain);
    const configUsers = allConfigsIndex ? allConfigsIndex[classRecurrentId(_class)] ?? [] : [];
    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(
        selected ? randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null : null,
    );

    useEffect(() => {
        if (selected) {
            setSelectAnimation(randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null);
        }
    }, [selected]);

    function selectClass() {
        onUpdateConfig(!selected);
    }

    const classColorRGB = (dark: boolean) =>
        `rgb(${hexWithOpacityToRgb(_class.activity.color, 0.6, dark ? 0 : 255).join(",")})`;

    const isInThePast = isClassInThePast(_class);

    const showSelected = !isInThePast && !_class.isCancelled && selected;

    const usersPlanned = configUsers.filter(
        ({ user_name }) => !userSessions.map((u) => u.user_name).includes(user_name),
    );

    const showScheduleAction = !isInThePast && selectable && !_class.isCancelled;
    const showUsersPlanned = userSessions.length > 0 || (!isInThePast && usersPlanned.length > 0);
    const showActions = showScheduleAction || showUsersPlanned;

    return (
        <Card
            sx={{
                background: `rgb(${hexWithOpacityToRgb("#ffffff", isInThePast ? 0.6 : 1, 255).join(",")})`,
                '[data-mui-color-scheme="dark"] &': {
                    background: `rgb(${hexWithOpacityToRgb("#191919", isInThePast ? 0.6 : 1, 0).join(",")})`,
                },
            }}
        >
            <Box
                sx={{
                    opacity: isInThePast || _class.isCancelled ? 0.5 : 1,
                    background: "none",
                    position: "relative",
                    borderLeft: `0.4rem solid ${classColorRGB(false)}`,
                    '[data-mui-color-scheme="dark"] &': {
                        borderLeft: `0.4rem solid ${classColorRGB(true)}`,
                    },
                }}
            >
                {!isInThePast && selectAnimation && (
                    <Box
                        className={
                            selectAnimation ? (showSelected ? selectAnimation.enter : selectAnimation.leave) : ""
                        }
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: "100%",
                            backgroundColor: classColorRGB(false),
                            '[data-mui-color-scheme="dark"] &': {
                                backgroundColor: classColorRGB(true),
                            },
                        }}
                    />
                )}
                <CardContent
                    className={"unselectable"}
                    onClick={onInfo}
                    sx={{ paddingBottom: 1, zIndex: 1, position: "relative", cursor: "pointer" }}
                >
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography
                            sx={{
                                textDecoration: isInThePast || _class.isCancelled ? "line-through" : "none",
                                fontSize: "1.05rem",
                                ...(showSelected ? { fontWeight: "bold" } : {}),
                            }}
                        >
                            {_class.activity.name}
                        </Typography>
                        {_class.isCancelled ? (
                            <Tooltip title={"Timen er avlyst"}>
                                <Badge
                                    overlap={"circular"}
                                    badgeContent={<CancelRounded fontSize={"small"} color={"error"} />}
                                >
                                    <ClassPopularityMeter _class={_class} historicPopularity={popularity} />
                                </Badge>
                            </Tooltip>
                        ) : (
                            <ClassPopularityMeter _class={_class} historicPopularity={popularity} />
                        )}
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                        {_class.startTime.toFormat("HH:mm")} - {_class.endTime.toFormat("HH:mm")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                        {_class.location.studio}
                    </Typography>
                    {_class.instructors.length > 0 && (
                        <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                            {_class.instructors.map((i) => i.name).join(", ")}
                        </Typography>
                    )}
                </CardContent>
                {showActions && (
                    <CardActions sx={{ padding: 0, zIndex: 1, position: "relative" }} disableSpacing>
                        <Box px={1.75} pt={0.5} pb={2} sx={{ width: "100%" }}>
                            <Box sx={{ display: "flex" }}>
                                {showScheduleAction && (
                                    <Tooltip title={(selected ? "Fjern fra" : "Legg til i") + " timeplan"}>
                                        <IconButton
                                            onClick={selectClass}
                                            size={"small"}
                                            sx={{
                                                padding: 0,
                                                height: 28, // to avoid jumping when avatars are displayed
                                            }}
                                        >
                                            {selected ? <EventBusy /> : <EventRepeat />}
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {showUsersPlanned && (
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
                                                <ClassUserAvatar
                                                    key={user_name}
                                                    username={user_name}
                                                    badgeIcon={
                                                        _class.isBookable ? <PlannedNotBookedBadgeIcon /> : undefined
                                                    }
                                                    loading={userSessionsLoading}
                                                />
                                            ))}
                                        {userSessions.length > 0 &&
                                            userSessions.map(({ user_name, status }) => (
                                                <Fragment key={user_name}>
                                                    <ClassUserAvatar
                                                        username={user_name}
                                                        invisibleBadge={isInThePast}
                                                        badgeIcon={
                                                            status === SessionStatus.NOSHOW ? (
                                                                <NoShowBadgeIcon />
                                                            ) : undefined
                                                        }
                                                        rippleColor={
                                                            status === SessionStatus.BOOKED ||
                                                            status === SessionStatus.CONFIRMED
                                                                ? StatusColors.ACTIVE
                                                                : status === SessionStatus.WAITLIST
                                                                ? StatusColors.WAITLIST
                                                                : undefined
                                                        }
                                                    />
                                                </Fragment>
                                            ))}
                                    </AvatarGroup>
                                )}
                            </Box>
                        </Box>
                    </CardActions>
                )}
            </Box>
        </Card>
    );
};

export default ClassCard;
