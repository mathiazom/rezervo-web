import { CancelRounded, EventBusy, EventRepeat } from "@mui/icons-material";
import { AvatarGroup, Badge, Box, Card, CardContent, Collapse, Tooltip, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { useEffect, useState } from "react";

import ClassPopularityMeter from "@/components/schedule/class/ClassPopularityMeter";
import ClassUserAvatar from "@/components/schedule/class/ClassUserAvatar";
import { NoShowBadgeIcon } from "@/components/utils/NoShowBadgeIcon";
import { PlannedNotBookedBadgeIcon } from "@/components/utils/PlannedNotBookedBadgeIcon";
import { isClassInThePast } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { randomElementFromArray } from "@/lib/utils/arrayUtils";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { shortenMiddleNames } from "@/lib/utils/textUtils";
import { EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS } from "@/types/animation";
import { ChainIdentifier, RezervoClass, RezervoInstructor } from "@/types/chain";
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
    const { userSessionsIndex, userSessionsIndexLoading, userSessionsIndexError } = useUserSessionsIndex(chain);
    const userSessionsLoading = userSessionsIndexLoading || userSessionsIndexError;
    const userSessions = userSessionsIndex?.[_class.id] ?? [];
    const { allConfigsIndex } = useUserConfig(chain);
    const configUsers = allConfigsIndex ? allConfigsIndex[classRecurrentId(_class)] ?? [] : [];
    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(
        selected ? randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null : null,
    );
    const [showSelectClassTooltip, setShowSelectClassTooltip] = useState(false);

    useEffect(() => {
        if (selected) {
            setSelectAnimation(randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null);
        }
    }, [selected]);

    function selectClass() {
        onUpdateConfig(!selected);
    }

    function formatInstructorNames(instructors: RezervoInstructor[]): string {
        const namesToShow = 2;
        const formattedNames = instructors
            .slice(0, namesToShow)
            .map((instructor) => shortenMiddleNames(instructor.name))
            .join(", ");

        return formattedNames + (instructors.length > namesToShow ? `, +${instructors.length - namesToShow}` : "");
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
                    sx={{
                        zIndex: 1,
                        position: "relative",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        "&:last-child": {
                            paddingBottom: 2,
                        },
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                textDecoration: isInThePast || _class.isCancelled ? "line-through" : "none",
                                fontSize: "1.05rem",
                                hyphens: "auto",
                                ...(showSelected ? { fontWeight: "bold" } : {}),
                            }}
                        >
                            {_class.activity.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                            {_class.startTime.toFormat("HH:mm")} - {_class.endTime.toFormat("HH:mm")}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                            {_class.location.studio}
                        </Typography>
                        {_class.instructors.length > 0 && (
                            <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                {formatInstructorNames(_class.instructors)}
                            </Typography>
                        )}
                        <Collapse in={showUsersPlanned}>
                            <Box pl={0.75} pt={1}>
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
                                            <Box key={user_name}>
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
                                            </Box>
                                        ))}
                                </AvatarGroup>
                            </Box>
                        </Collapse>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", ml: 0.5 }}>
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
                        {showScheduleAction && (
                            <Tooltip
                                title={(selected ? "Fjern fra" : "Legg til i") + " timeplan"}
                                // Hide the tooltip when clicked
                                open={showSelectClassTooltip}
                                disableHoverListener
                                onMouseEnter={() => setShowSelectClassTooltip(true)}
                                onMouseLeave={() => setShowSelectClassTooltip(false)}
                            >
                                <IconButton
                                    onClick={(event) => {
                                        // Prevent onInfo()
                                        event.stopPropagation();
                                        selectClass();
                                        setShowSelectClassTooltip(false);
                                    }}
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
                    </Box>
                </CardContent>
            </Box>
        </Card>
    );
};

export default ClassCard;
