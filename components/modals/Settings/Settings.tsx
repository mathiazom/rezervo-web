import {
    Box,
    CircularProgress,
    Divider,
    FormControl,
    FormGroup,
    FormLabel,
    Input,
    styled,
    Switch as MaterialUISwitch,
    Typography,
} from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ConfigPayload, NotificationsConfig } from "../../../types/rezervo";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { DEFAULT_REMINDER_HOURS } from "../../../config/config";
import { useUserConfig } from "../../../hooks/useUserConfig";
import CalendarFeed from "./CalendarFeed";

// Fix track not visible with "system" color scheme
const Switch = styled(MaterialUISwitch)(({ theme }) => ({
    "& .MuiSwitch-switchBase": {
        "&.Mui-checked": {
            "& + .MuiSwitch-track": {
                '[data-mui-color-scheme="light"] &': {
                    backgroundColor: theme.palette.primary.main,
                },
            },
        },
    },
    "& .MuiSwitch-track": {
        '[data-mui-color-scheme="light"] &': {
            backgroundColor: "#000",
        },
    },
}));

export default function Settings({
    bookingActive,
    setBookingActive,
    notificationsConfig,
    setNotificationsConfig,
}: {
    bookingActive: boolean;
    setBookingActive: Dispatch<SetStateAction<boolean>>;
    notificationsConfig: NotificationsConfig | null;
    setNotificationsConfig: Dispatch<NotificationsConfig>;
}) {
    const { userConfig, putUserConfig } = useUserConfig();
    const [reminderActive, setReminderActive] = useState(notificationsConfig?.reminder_hours_before != null);
    const [reminderHours, setReminderHours] = useState<number | null>(
        notificationsConfig?.reminder_hours_before ?? null
    );
    const [bookingActiveLoading, setBookingActiveLoading] = useState(false);
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);

    useEffect(() => {
        const newReminderHours = notificationsConfig?.reminder_hours_before;
        const newReminderActive = newReminderHours != null;
        setReminderActive(newReminderActive);
        if (newReminderActive) {
            setReminderHours(newReminderHours);
        }
    }, [notificationsConfig?.reminder_hours_before, reminderHours]);

    async function onBookingActiveChanged(active: boolean) {
        setBookingActive(active);
        setBookingActiveLoading(true);
        await putUserConfig({
            ...userConfig,
            active: active,
        } as ConfigPayload);
        setBookingActiveLoading(false);
    }

    function handleReminderActiveChanged(active: boolean) {
        setReminderActive(active);
        onNotificationsConfigChanged({
            ...notificationsConfig,
            reminder_hours_before: active ? reminderHours ?? DEFAULT_REMINDER_HOURS : null,
        });
    }

    function handleReminderHoursChanged(reminderHours: number | null) {
        setReminderHours(reminderHours);
        if (reminderHours == null) {
            return;
        }
        onNotificationsConfigChanged({
            ...notificationsConfig,
            reminder_hours_before: reminderActive ? reminderHours : null,
        });
    }

    function onNotificationsConfigChanged(notificationsConfig: NotificationsConfig) {
        setNotificationsConfig(notificationsConfig);
        setNotificationsConfigLoading(true);
        return putUserConfig({
            ...userConfig,
            notifications: notificationsConfig,
        } as ConfigPayload).then(() => setNotificationsConfigLoading(false));
    }

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90%",
                maxHeight: "80%",
                overflowY: "scroll",
                maxWidth: 520,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                p: 4,
                backgroundColor: "white",
                '[data-mui-color-scheme="dark"] &': {
                    backgroundColor: "#111",
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
                <Typography variant="h6" component="h2">
                    Innstillinger
                </Typography>
            </Box>
            <Box pt={2} sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <FormGroup sx={{ gap: "1rem" }}>
                    <FormGroup>
                        <FormLabel>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                                <PlayCircleOutlineRoundedIcon />
                                <Typography
                                    sx={{
                                        userSelect: "none",
                                    }}
                                >
                                    Booking aktiv
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "right",
                                        flexGrow: 1,
                                    }}
                                >
                                    {bookingActiveLoading && <CircularProgress size="1rem" />}
                                    <Switch
                                        checked={bookingActive}
                                        onChange={(_, checked) => onBookingActiveChanged(checked)}
                                        inputProps={{
                                            "aria-label": "booking-aktiv",
                                        }}
                                    />
                                </Box>
                            </Box>
                        </FormLabel>
                    </FormGroup>
                    <Divider orientation="horizontal" />
                    <FormGroup>
                        <FormLabel>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                                <NotificationsActiveRoundedIcon />
                                <Typography
                                    sx={{
                                        userSelect: "none",
                                    }}
                                >
                                    Påminnelse om time
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "right",
                                        flexGrow: 1,
                                    }}
                                >
                                    {notificationsConfigLoading && <CircularProgress size="1rem" />}
                                    <Switch
                                        checked={reminderActive}
                                        onChange={(_, checked) => handleReminderActiveChanged(checked)}
                                        inputProps={{
                                            "aria-label": "påminnelse-aktiv",
                                        }}
                                    />
                                </Box>
                            </Box>
                        </FormLabel>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center", ml: "33px", pb: 1 }}>
                            <FormControl>
                                <Input
                                    value={reminderHours}
                                    onChange={({ target: { value } }) => {
                                        handleReminderHoursChanged(value == "" ? null : Number(value));
                                    }}
                                    inputProps={{
                                        step: 0.1,
                                        min: 0,
                                        max: 48,
                                        type: "number",
                                    }}
                                    disabled={!reminderActive}
                                    sx={{ width: "4rem" }}
                                />
                            </FormControl>
                            <FormLabel disabled={!reminderActive}>timer før</FormLabel>
                        </Box>
                    </FormGroup>
                    <Divider />
                    <CalendarFeed />
                </FormGroup>
            </Box>
        </Box>
    );
}
