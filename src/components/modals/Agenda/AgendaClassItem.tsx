import { Clear, EventBusy } from "@mui/icons-material";
import { Avatar, Box, Card, CardContent, Chip, CircularProgress, Tooltip, Typography, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ConfirmCancellation from "@/components/schedule/class/ConfirmCancellation";
import { PLANNED_SESSIONS_NEXT_WHOLE_WEEKS } from "@/lib/consts";
import { getCapitalizedWeekdays, LocalizedDateTime, zeroIndexedWeekday } from "@/lib/helpers/date";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { ChainIdentifier } from "@/types/chain";
import { ClassConfig } from "@/types/config";
import { SessionStatus, UserAgendaClass } from "@/types/userSessions";

export default function AgendaClassItem({
    chain,
    classConfig,
    agendaClass,
}: { chain: ChainIdentifier } & (
    | { classConfig: ClassConfig; agendaClass?: never }
    | { classConfig?: never; agendaClass: UserAgendaClass }
)) {
    const theme = useTheme();
    const router = useRouter();
    const { putUserConfig, userConfig } = useUserConfig(chain);

    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const classColorRGB = (dark: boolean) =>
        agendaClass?.class_data
            ? `rgb(${hexWithOpacityToRgb(agendaClass?.class_data.activity.color, 0.6, dark ? 0 : 255).join(",")})`
            : "#111";

    const displayName = agendaClass?.class_data.activity.name ?? classConfig!.displayName;

    function hoursAndMinutesToClockString(hours: number, minutes: number) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    const timeFrom = agendaClass?.class_data.startTime
        ? agendaClass?.class_data.startTime.toFormat("HH:mm")
        : `${getCapitalizedWeekdays()[classConfig!.weekday]}er\n${hoursAndMinutesToClockString(
              classConfig!.startTime.hour,
              classConfig!.startTime.minute,
          )}`;

    const timeTo = agendaClass?.class_data?.endTime ? agendaClass?.class_data.endTime.toFormat("HH:mm") : null;

    return (
        <>
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
                onClick={() => {
                    if (!agendaClass) {
                        return;
                    }
                    const weekOffset = Math.floor(
                        agendaClass.class_data.startTime.diff(LocalizedDateTime.now(), "weeks").weeks,
                    );
                    router.push(`/${chain}?weekOffset=${weekOffset}&classId=${agendaClass.class_data.id}`);
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background:
                            agendaClass === undefined
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
                            cursor: agendaClass?.class_data === undefined ? "auto" : "pointer",
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
                                    {agendaClass?.status === SessionStatus.WAITLIST && (
                                        <Tooltip title={"Du er på venteliste for denne timen"}>
                                            <Chip size={"small"} color={"warning"} label={"Venteliste"} />
                                        </Tooltip>
                                    )}
                                </Box>
                                <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                    {`${timeFrom}${timeTo ? ` - ${timeTo}` : ""}`}
                                </Typography>
                                {agendaClass?.class_data && (
                                    <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                        {agendaClass?.class_data.location.studio}
                                    </Typography>
                                )}
                                {agendaClass?.class_data && (
                                    <Typography sx={{ fontSize: "0.85rem" }} variant="body2" color="text.secondary">
                                        {agendaClass?.class_data.instructors.map((i) => i.name).join(", ")}
                                    </Typography>
                                )}
                            </Box>
                            {agendaClass?.class_data === undefined && (
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
                                {agendaClass?.status === SessionStatus.BOOKED ||
                                agendaClass?.status === SessionStatus.WAITLIST ? (
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
                                                setIsLoading(true);
                                                const weekday = agendaClass
                                                    ? zeroIndexedWeekday(agendaClass?.class_data.startTime.weekday)
                                                    : classConfig?.weekday;
                                                await putUserConfig({
                                                    active: userConfig!.active,
                                                    recurringBookings: userConfig!.recurringBookings.filter(
                                                        (cc) =>
                                                            !(
                                                                cc.weekday === weekday &&
                                                                cc.startTime.hour ===
                                                                    (agendaClass?.class_data.startTime.hour ??
                                                                        classConfig!.startTime.hour) &&
                                                                cc.startTime.minute ===
                                                                    (agendaClass?.class_data.startTime.minute ??
                                                                        classConfig!.startTime.minute) &&
                                                                cc.activityId ===
                                                                    String(
                                                                        agendaClass?.class_data.activity.id ??
                                                                            classConfig!.activityId,
                                                                    ) &&
                                                                cc.locationId ===
                                                                    (agendaClass?.class_data.location.id ??
                                                                        classConfig!.locationId)
                                                            ),
                                                    ),
                                                });
                                                setIsLoading(false);
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
            {(agendaClass?.status == SessionStatus.WAITLIST || agendaClass?.status === SessionStatus.BOOKED) && (
                <ConfirmCancellation
                    open={showCancelConfirmation}
                    setOpen={setShowCancelConfirmation}
                    setLoading={setIsLoading}
                    chain={chain}
                    _class={agendaClass.class_data}
                />
            )}
        </>
    );
}
