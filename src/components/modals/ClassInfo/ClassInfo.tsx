import { useUser } from "@auth0/nextjs-auth0/client";
import {
    Add,
    Cancel,
    Clear,
    Diversity3Rounded,
    EventBusy,
    EventRepeat,
    HourglassTop,
    Login,
    PauseCircleRounded,
    SettingsRounded,
} from "@mui/icons-material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert, AlertTitle, Box, Stack, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Image from "next/image";
import React, { useState } from "react";

import ClassInfoChip from "@/components/modals/ClassInfo/ClassInfoChip";
import ClassInfoUsersGroup from "@/components/modals/ClassInfo/ClassInfoUsersGroup";
import { ClassPopularityIcon, getClassPopularityColors } from "@/components/schedule/class/ClassPopularityMeter";
import ConfirmCancellation from "@/components/schedule/class/ConfirmCancellation";
import ExpandableText from "@/components/utils/ExpandableText";
import { isClassInThePast } from "@/lib/helpers/date";
import { determineClassPopularity, stringifyClassPopularity } from "@/lib/helpers/popularity";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { hexWithOpacityToRgb } from "@/lib/utils/colorUtils";
import { ChainIdentifier, RezervoClass } from "@/types/chain";
import { ClassPopularity } from "@/types/popularity";
import { SessionStatus } from "@/types/userSessions";

export default function ClassInfo({
    chain,
    _class,
    classPopularity,
    onUpdateConfig,
}: {
    chain: ChainIdentifier;
    _class: RezervoClass;
    classPopularity: ClassPopularity;
    onUpdateConfig: (classId: string, selected: boolean) => void;
}) {
    const theme = useTheme();
    const { user } = useUser();
    const { userConfig, userConfigLoading, userConfigError, allConfigsIndex } = useUserConfig(chain);
    const configUsers = allConfigsIndex ? allConfigsIndex[classRecurrentId(_class)] ?? [] : [];
    const { userSessionsIndex, userSessionsIndexLoading, userSessionsIndexError, mutateSessionsIndex } =
        useUserSessionsIndex(chain);
    const { mutateUserSessions } = useUserSessions();
    const userSessionsLoading = userSessionsIndexLoading || userSessionsIndexError;
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

    const noShowUsers = userSessions.filter(({ status }) => status === SessionStatus.NOSHOW);

    const selfNoShow = noShowUsers.some((u) => u.is_self);

    const usersPlanned = configUsers.filter(
        ({ user_name }) => !userSessions.map((u) => u.user_name).includes(user_name),
    );

    const selfPlanned = usersPlanned.some((u) => u.is_self);

    const classInUserConfig = userConfig?.recurringBookings
        ?.map(classConfigRecurrentId)
        .includes(classRecurrentId(_class));

    const [bookingLoading, setBookingLoading] = useState(false);

    const [cancelBookingConfirmationOpen, setCancelBookingConfirmationOpen] = useState(false);

    async function book() {
        setBookingLoading(true);
        await fetch(`/api/${chain}/book`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        await mutateUserSessions();
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
                overflowY: "auto",
                maxWidth: 600,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                pb: 2,
                backgroundColor: "white",
                '[data-mui-color-scheme="dark"] &': {
                    backgroundColor: "#181818",
                },
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    height: 300,
                    color: "#fff",
                }}
            >
                <Image
                    src={_class.activity.image ?? "/defaultClassInfo.avif"}
                    alt={_class.activity.name}
                    width={600}
                    height={300}
                    style={{
                        maxWidth: "100%",
                        objectFit: "cover",
                        padding: 0,
                        position: "absolute",
                        zIndex: -1,
                        ...(_class.isCancelled
                            ? {
                                  filter: "grayscale(1)",
                              }
                            : {}),
                    }}
                ></Image>
                <Stack height={"100%"} px={4} py={2} direction={"column"} justifyContent={"flex-end"}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
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
                                boxShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
                            }}
                        />
                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                                fontWeight: "bold",
                                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.7)",
                            }}
                        >
                            {_class.activity.name}
                        </Typography>
                    </Box>
                    <Stack direction={"row"} my={1}>
                        {_class.isCancelled && (
                            <ClassInfoChip
                                icon={<Cancel />}
                                color={"error"}
                                label={`Timen ${isInThePast ? "ble" : "er"} avlyst! ${_class.cancelText ? `Årsak: ${_class.cancelText}` : ``}`}
                            />
                        )}
                    </Stack>
                    <Stack gap={1}>
                        <Stack direction={"row"} gap={1} flexWrap={"wrap"}>
                            <ClassInfoChip
                                icon={<CalendarMonthIcon />}
                                label={_class.startTime.toFormat("EEEE d. LLLL")}
                            />
                            <ClassInfoChip
                                icon={<AccessTimeRoundedIcon />}
                                label={`${_class.startTime.toFormat("HH:mm")}–${_class.endTime.toFormat("HH:mm")}`}
                            />
                            <ClassInfoChip
                                icon={<LocationOnRoundedIcon />}
                                label={`${_class.location.studio} ${_class.location.room && _class.location.room.length > 0 ? `, ${_class.location.room}` : ""}`}
                            />
                            {_class.instructors.length > 0 && (
                                <ClassInfoChip
                                    icon={<PersonRoundedIcon />}
                                    label={_class.instructors.map((i) => i.name).join(", ")}
                                />
                            )}
                            {((!_class.isBookable && !isInThePast) || _class.isCancelled) && (
                                <ClassInfoChip icon={<Diversity3Rounded />} label={`${_class.totalSlots} plasser`} />
                            )}
                            {!_class.isCancelled && (
                                <ClassInfoChip
                                    sx={{
                                        color: "#fff",
                                        backgroundColor:
                                            getClassPopularityColors(theme)[
                                                _class.isBookable || isInThePast
                                                    ? determineClassPopularity(_class)
                                                    : classPopularity
                                            ],
                                        height: "auto",
                                        py: 0.3,
                                        "& .MuiChip-label": {
                                            whiteSpace: "normal",
                                        },
                                    }}
                                    icon={
                                        <Box height={24} ml={0.5} mt={-0.1}>
                                            <ClassPopularityIcon
                                                popularity={
                                                    _class.isBookable || isInThePast
                                                        ? determineClassPopularity(_class)
                                                        : classPopularity
                                                }
                                                withColor={false}
                                            />
                                        </Box>
                                    }
                                    label={stringifyClassPopularity(_class, classPopularity)}
                                />
                            )}
                            {!isInThePast && (
                                <>
                                    {usersPlanned.length > 0 && (
                                        <ClassInfoChip
                                            color={_class.isBookable || _class.isCancelled ? "error" : "primary"}
                                            label={
                                                <ClassInfoUsersGroup
                                                    users={usersPlanned}
                                                    includeSelf={selfPlanned}
                                                    loading={userSessionsLoading}
                                                    text={
                                                        _class.isBookable
                                                            ? "har planlagt denne timen, men ikke booket plass!"
                                                            : _class.isCancelled
                                                              ? "skulle på denne timen"
                                                              : "skal på denne timen"
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                    {usersOnWaitlist.length > 0 && (
                                        <ClassInfoChip
                                            color={"warning"}
                                            label={
                                                <ClassInfoUsersGroup
                                                    users={usersOnWaitlist}
                                                    includeSelf={selfOnWaitlist}
                                                    isCancelled={_class.isCancelled}
                                                    text={
                                                        _class.isCancelled
                                                            ? "var på venteliste for denne timen"
                                                            : "er på venteliste for denne timen"
                                                    }
                                                />
                                            }
                                        />
                                    )}
                                </>
                            )}
                            {usersBooked.length > 0 && (
                                <ClassInfoChip
                                    color={"primary"}
                                    label={
                                        <ClassInfoUsersGroup
                                            users={usersBooked}
                                            includeSelf={selfBooked}
                                            isCancelled={_class.isCancelled}
                                            text={
                                                _class.isCancelled
                                                    ? "hadde booket denne timen"
                                                    : isInThePast
                                                      ? "var på denne timen"
                                                      : "har booket denne timen"
                                            }
                                        />
                                    }
                                />
                            )}
                            {noShowUsers.length > 0 && (
                                <ClassInfoChip
                                    color={"error"}
                                    label={
                                        <ClassInfoUsersGroup
                                            users={noShowUsers}
                                            includeSelf={selfNoShow}
                                            text={"booket plass, men møtte ikke opp!"}
                                        />
                                    }
                                />
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </Box>
            <Box px={4}>
                {user === undefined && !isInThePast && (
                    <Alert severity="info" sx={{ mt: 1.5 }} icon={<Login fontSize={"small"} />}>
                        Du må logge inn for å kunne booke eller legge til timer i timeplanen
                    </Alert>
                )}
                {user !== undefined && userConfig === undefined && !isInThePast && (
                    <Alert severity="info" sx={{ mt: 1.5 }}>
                        <AlertTitle>
                            Koble til <b>{chain.toUpperCase()}</b>-medlemskap
                        </AlertTitle>
                        Du må koble <b>{chain.toUpperCase()}</b>-medlemskapet ditt til <b>rezervo</b> for å kunne booke
                        eller legge til timer i timeplanen. Trykk på{" "}
                        <SettingsRounded fontSize={"small"} sx={{ mb: -0.6 }} /> Innstillinger for å komme i gang.
                    </Alert>
                )}
                {_class.activity.additionalInformation && (
                    <Alert sx={{ mt: 1.5 }} severity={"info"}>
                        {_class.activity.additionalInformation}
                    </Alert>
                )}
                <ExpandableText
                    text={_class.activity.description}
                    shouldCollapse={!isInThePast && userConfig != undefined}
                />
                {user &&
                    userConfig != undefined &&
                    !userConfigLoading &&
                    !userConfigError &&
                    !isInThePast &&
                    !_class.isCancelled && (
                        <>
                            {selfBooked || selfOnWaitlist ? (
                                <LoadingButton
                                    startIcon={<Clear />}
                                    sx={{ mt: 2, mr: 1 }}
                                    variant={"outlined"}
                                    color={"error"}
                                    disabled={isInThePast || !_class.isBookable}
                                    onClick={() => setCancelBookingConfirmationOpen(true)}
                                    loading={bookingLoading}
                                >
                                    Avbestill
                                </LoadingButton>
                            ) : (
                                !_class.isCancelled && (
                                    <LoadingButton
                                        startIcon={_class.availableSlots > 0 ? <Add /> : <HourglassTop />}
                                        color={_class.availableSlots > 0 ? "primary" : "warning"}
                                        sx={{ mt: 2, mr: 1 }}
                                        variant={"outlined"}
                                        disabled={isInThePast || !_class.isBookable}
                                        onClick={() => book()}
                                        loading={bookingLoading}
                                    >
                                        {_class.availableSlots > 0 ? "Book nå" : "Sett meg på venteliste"}
                                    </LoadingButton>
                                )
                            )}
                            {classInUserConfig ? (
                                <Button
                                    sx={{ mt: 2 }}
                                    variant={"outlined"}
                                    color={"error"}
                                    startIcon={<EventBusy />}
                                    onClick={() => onUpdateConfig(classRecurrentId(_class), false)}
                                >
                                    Fjern fra timeplan
                                </Button>
                            ) : (
                                <Button
                                    sx={{ mt: 2 }}
                                    variant={"outlined"}
                                    startIcon={<EventRepeat />}
                                    onClick={() => onUpdateConfig(classRecurrentId(_class), true)}
                                >
                                    Legg til i timeplan
                                </Button>
                            )}
                            {!_class.isBookable &&
                                (userConfig?.active === false && classInUserConfig ? (
                                    <Alert severity={"info"} sx={{ mt: 1 }} icon={<PauseCircleRounded />}>
                                        <AlertTitle>Automatisk booking er satt på pause</AlertTitle>
                                        Denne timen vil ikke bli booket automatisk. Du kan skru på automatisk booking i
                                        innstillinger, slik at timene i timeplanen blir booket automatisk
                                    </Alert>
                                ) : (
                                    !_class.isCancelled && (
                                        <Alert sx={{ mt: 1 }} severity="info">
                                            Booking for denne timen har ikke åpnet enda
                                            {classInUserConfig &&
                                                userConfig?.active &&
                                                ", men den vil bli booket automatisk når bookingen åpner"}
                                        </Alert>
                                    )
                                ))}
                        </>
                    )}
                <ConfirmCancellation
                    open={cancelBookingConfirmationOpen}
                    setOpen={setCancelBookingConfirmationOpen}
                    setLoading={setBookingLoading}
                    chain={chain}
                    _class={_class}
                />
            </Box>
        </Box>
    );
}
