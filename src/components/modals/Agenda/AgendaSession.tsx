import { Clear, EventBusy, HourglassTopRounded } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, CircularProgress, Tooltip, Typography, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import React, { useState } from "react";

import ConfirmCancellation from "@/components/schedule/class/ConfirmCancellation";
import { CLASS_ID_QUERY_PARAM, ISO_WEEK_QUERY_PARAM, PLANNED_SESSIONS_NEXT_WHOLE_WEEKS } from "@/lib/consts";
import { compactISOWeekString, getCapitalizedWeekdays, zeroIndexedWeekday } from "@/lib/helpers/date";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { ChainIdentifier } from "@/types/chain";
import { ChainConfig, ClassConfig } from "@/types/config";
import { BaseUserSession, SessionStatus } from "@/types/userSessions";

export default function AgendaSession({
    chain,
    classConfig,
    userSession,
}: { chain: ChainIdentifier } & (
    | { classConfig: ClassConfig; userSession?: never }
    | { classConfig?: never; userSession: BaseUserSession }
)) {
    const theme = useTheme();
    const { putUserConfig, userConfig } = useUserConfig(chain);

    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const classColorRGB = (dark: boolean) =>
        userSession?.classData
            ? hexWithOpacityToRgb(userSession?.classData.activity.color, 0.6, dark ? 0 : 255)
            : "#111";

    const displayName = userSession?.classData.activity.name ?? classConfig!.displayName;

    function hoursAndMinutesToClockString(hours: number, minutes: number) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    const timeFrom = userSession?.classData.startTime
        ? userSession?.classData.startTime.toFormat("HH:mm")
        : `${getCapitalizedWeekdays()[classConfig!.weekday]}er\n${hoursAndMinutesToClockString(
              classConfig!.startTime.hour,
              classConfig!.startTime.minute,
          )}`;

    const timeTo = userSession?.classData?.endTime ? userSession?.classData.endTime.toFormat("HH:mm") : null;

    async function removeFromAgenda() {
        if (userConfig == undefined) {
            return;
        }
        const config: ChainConfig = userConfig;
        setIsLoading(true);
        const weekday = userSession
            ? zeroIndexedWeekday(userSession.classData.startTime.weekday)
            : classConfig?.weekday;
        const startTimeHour = userSession?.classData.startTime.hour ?? classConfig!.startTime.hour;
        const startTimeMinute = userSession?.classData.startTime.minute ?? classConfig!.startTime.minute;
        const activityId = userSession?.classData.activity.id.toString() ?? classConfig!.activityId;
        const locationId = userSession?.classData.location.id ?? classConfig!.locationId;
        await putUserConfig({
            active: config.active,
            recurringBookings: config.recurringBookings.filter(
                (cc) =>
                    !(
                        cc.weekday === weekday &&
                        cc.startTime.hour === startTimeHour &&
                        cc.startTime.minute === startTimeMinute &&
                        cc.activityId === activityId &&
                        cc.locationId === locationId
                    ),
            ),
        });
        setIsLoading(false);
    }

    return (
        <Link
            href={{
                pathname: `/${chain}`,
                query: {
                    [ISO_WEEK_QUERY_PARAM]:
                        userSession != null ? compactISOWeekString(userSession.classData.startTime) : null,
                    [CLASS_ID_QUERY_PARAM]: userSession?.classData.id,
                },
            }}
        >
            <Card
                sx={{
                    position: "relative",
                    borderLeft: `0.4rem solid ${classColorRGB(false)}`,
                    backgroundColor: "white",
                    '[data-mui-color-scheme="dark"] &': {
                        borderLeft: `0.4rem solid ${classColorRGB(true)}`,
                        backgroundColor: "#111",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background:
                            userSession === undefined
                                ? `repeating-linear-gradient(
                            -55deg,
                            ${theme.palette.background.default},
                            ${theme.palette.background.default} 10px,
                            ${theme.palette.background.paper} 10px,
                            ${theme.palette.background.paper} 20px)`
                                : undefined,
                    }}
                >
                    <CardContent
                        className={"unselectable"}
                        sx={{
                            paddingBottom: 2,
                            flexGrow: 1,
                            cursor: userSession?.classData === undefined ? "auto" : "pointer",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Typography sx={{ fontSize: "1.05rem" }}>{displayName} </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                    {`${timeFrom}${timeTo ? ` - ${timeTo}` : ""}`}
                                </Typography>
                                {userSession?.classData && (
                                    <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                        {userSession?.classData.location.studio}
                                    </Typography>
                                )}
                                {userSession?.classData && (
                                    <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                        {userSession?.classData.instructors.map((i) => i.name).join(", ")}
                                    </Typography>
                                )}
                                {userSession?.status === SessionStatus.WAITLIST && (
                                    <Tooltip title={"Du er på venteliste for denne timen"}>
                                        <Chip
                                            size={"small"}
                                            color={"warning"}
                                            label={"Venteliste"}
                                            icon={<HourglassTopRounded />}
                                            sx={{
                                                marginY: "0.2rem",
                                                "& .MuiChip-icon": {
                                                    fontSize: "0.85rem",
                                                    marginLeft: "0.5rem",
                                                },
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Box>
                            {userSession?.classData === undefined && (
                                <Tooltip
                                    title={`Denne timen går ikke de neste ${PLANNED_SESSIONS_NEXT_WHOLE_WEEKS} ukene`}
                                >
                                    <Avatar
                                        alt={"Ghost class"}
                                        src={"/ghost.png"}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            marginLeft: 1,
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Box>
                    </CardContent>
                    <Box sx={{ display: "flex", marginRight: 2, alignItems: "center" }}>
                        {isLoading ? (
                            <CircularProgress size={18} sx={{ marginX: "0.5rem" }} />
                        ) : (
                            <>
                                {userSession?.status === SessionStatus.BOOKED ||
                                userSession?.status === SessionStatus.WAITLIST ? (
                                    <Tooltip title={"Avbestill"}>
                                        <IconButton
                                            color={"error"}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setShowCancelConfirmation(true);
                                            }}
                                            size={"small"}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title={"Fjern fra timeplan"}>
                                        <IconButton
                                            onClick={async (event) => {
                                                event.stopPropagation();
                                                await removeFromAgenda();
                                            }}
                                            size={"small"}
                                        >
                                            <EventBusy />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
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
                            backgroundColor: "#111",
                        },
                    }}
                />
            </Card>
            {(userSession?.status == SessionStatus.WAITLIST || userSession?.status === SessionStatus.BOOKED) && (
                <ConfirmCancellation
                    open={showCancelConfirmation}
                    setOpen={setShowCancelConfirmation}
                    setLoading={setIsLoading}
                    chain={chain}
                    _class={userSession.classData}
                />
            )}
        </Link>
    );
}
