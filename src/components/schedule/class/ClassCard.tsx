import { CancelRounded, EventBusy, EventRepeat } from "@mui/icons-material";
import { AvatarGroup, Badge, Box, Card, CardContent, Collapse, Tooltip, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";

import ClassPopularityMeter from "@/components/schedule/class/ClassPopularityMeter";
import ClassUserAvatar from "@/components/schedule/class/ClassUserAvatar";
import { NoShowBadgeIcon } from "@/components/utils/NoShowBadgeIcon";
import { PlannedNotBookedBadgeIcon } from "@/components/utils/PlannedNotBookedBadgeIcon";
import { isClassInThePast } from "@/lib/helpers/date";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { randomElementFromArray, userNameWithIsSelfComparator } from "@/lib/utils/arrayUtils";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { shortenMiddleNames } from "@/lib/utils/textUtils";
import { EnterLeaveAnimation, OVER_THE_TOP_ANIMATIONS } from "@/types/animation";
import { ChainIdentifier, RezervoClass, RezervoInstructor } from "@/types/chain";
import { ClassPopularity } from "@/types/popularity";
import { SessionStatus, StatusColors } from "@/types/userSessions";

const AVATAR_SIZE = 24;

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
    const userSessions = userSessionsIndex?.[_class.id]?.sort(userNameWithIsSelfComparator) ?? [];
    const { allConfigsIndex } = useUserConfig(chain);
    const configUsers = allConfigsIndex ? (allConfigsIndex[classRecurrentId(_class)] ?? []) : [];
    const [selectAnimation, setSelectAnimation] = useState<EnterLeaveAnimation | null>(
        selected ? (randomElementFromArray(OVER_THE_TOP_ANIMATIONS) ?? null) : null,
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

    const classColorRGB = (dark: boolean) => hexWithOpacityToRgb(_class.activity.color, 0.6, dark ? 0 : 255);

    const isInThePast = isClassInThePast(_class);

    const showSelected = !isInThePast && !_class.isCancelled && selected;

    const usersPlanned = configUsers
        .filter(({ userName }) => !userSessions.map((u) => u.userName).includes(userName))
        .sort(userNameWithIsSelfComparator);

    const showScheduleAction = !isInThePast && selectable && !_class.isCancelled;
    const showUsersPlanned = userSessions.length > 0 || (!isInThePast && usersPlanned.length > 0);

    return (
        <Card
            sx={{
                background: hexWithOpacityToRgb("#ffffff", isInThePast ? 0.6 : 1, 255),
                "@media (prefers-color-scheme: dark)": {
                    background: hexWithOpacityToRgb("#191919", isInThePast ? 0.6 : 1, 0),
                },
            }}
        >
            <Box
                onClick={onInfo}
                sx={{
                    opacity: isInThePast || _class.isCancelled ? 0.5 : 1,
                    background: "none",
                    position: "relative",
                    borderLeft: `0.4rem solid ${classColorRGB(false)}`,
                    "@media (prefers-color-scheme: dark)": {
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
                            "@media (prefers-color-scheme: dark)": {
                                backgroundColor: classColorRGB(true),
                            },
                        }}
                    />
                )}
                <CardContent
                    sx={{
                        zIndex: 1,
                        position: "relative",
                        display: "flex",
                        justifyContent: "space-between",
                        "&:last-child": {
                            paddingBottom: 2,
                        },
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={[
                                {
                                    textDecoration: isInThePast || _class.isCancelled ? "line-through" : "none",
                                    fontSize: "1.05rem",
                                    hyphens: "auto",
                                },
                                showSelected ? { fontWeight: "bold" } : {},
                            ]}
                        >
                            {_class.activity.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.85rem",
                            }}
                        >
                            {_class.startTime.toFormat("HH:mm")} - {_class.endTime.toFormat("HH:mm")}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                fontSize: "0.85rem",
                            }}
                        >
                            {_class.location.studio}
                        </Typography>
                        {_class.instructors.length > 0 && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "text.secondary",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {formatInstructorNames(_class.instructors)}
                            </Typography>
                        )}
                        <Collapse in={showUsersPlanned}>
                            <Box
                                sx={{
                                    pl: 0.75,
                                    pt: 1,
                                }}
                            >
                                <AvatarGroup
                                    max={4}
                                    sx={{
                                        justifyContent: "start",
                                        marginLeft: "auto",
                                        "& .MuiAvatar-root": {
                                            width: AVATAR_SIZE,
                                            height: AVATAR_SIZE,
                                            fontSize: 12,
                                            borderColor: "white",
                                            "@media (prefers-color-scheme: dark)": {
                                                borderColor: "#191919",
                                            },
                                        },
                                    }}
                                >
                                    {!isInThePast &&
                                        usersPlanned.length > 0 &&
                                        usersPlanned.map(({ userId, userName }) => (
                                            <ClassUserAvatar
                                                key={userId}
                                                userId={userId}
                                                username={userName}
                                                size={AVATAR_SIZE}
                                                badgeIcon={
                                                    _class.isBookable ? <PlannedNotBookedBadgeIcon /> : undefined
                                                }
                                                loading={userSessionsLoading}
                                            />
                                        ))}
                                    {userSessions.length > 0 &&
                                        userSessions.map(({ userId, userName, status }) => (
                                            <Box key={userId}>
                                                <ClassUserAvatar
                                                    userId={userId}
                                                    username={userName}
                                                    size={AVATAR_SIZE}
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
                            (_class.totalSlots !== null || (_class.isBookable && _class.waitingListCount !== null)) && (
                                <ClassPopularityMeter _class={_class} historicPopularity={popularity} />
                            )
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
                                        marginTop: "auto",
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
