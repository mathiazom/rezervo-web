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
import React, { useEffect, useState } from "react";
import { NotificationsConfig } from "../types/rezervoTypes";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { DEFAULT_REMINDER_HOURS } from "../config/config";

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
    bookingActiveLoading,
    onBookingActiveChanged,
    notificationsConfig,
    notificationsConfigLoading,
    onNotificationsConfigChanged,
}: {
    bookingActive: boolean;
    bookingActiveLoading: boolean;
    // eslint-disable-next-line no-unused-vars
    onBookingActiveChanged: (active: boolean) => void;
    notificationsConfig: NotificationsConfig | null;
    notificationsConfigLoading: boolean;
    // eslint-disable-next-line no-unused-vars
    onNotificationsConfigChanged: (notificationsConfig: NotificationsConfig) => void;
}) {
    const [reminderActive, setReminderActive] = useState(notificationsConfig?.reminder_hours_before != null);
    const [reminderHours, setReminderHours] = useState<number | null>(
        notificationsConfig?.reminder_hours_before ?? null
    );

    useEffect(() => {
        const newReminderHours = notificationsConfig?.reminder_hours_before;
        const newReminderActive = newReminderHours != null;
        setReminderActive(newReminderActive);
        if (newReminderActive) {
            setReminderHours(newReminderHours);
        }
    }, [notificationsConfig?.reminder_hours_before, reminderHours]);

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
            <Box pt={2} pb={2}>
                <FormGroup sx={{ gap: 1 }}>
                    <FormGroup>
                        <FormLabel>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                                <PlayCircleOutlineRoundedIcon />
                                <Typography>Booking aktiv</Typography>
                                <Switch
                                    checked={bookingActive}
                                    onChange={(_, checked) => onBookingActiveChanged(checked)}
                                    inputProps={{
                                        "aria-label": "booking-aktiv",
                                    }}
                                />
                                {bookingActiveLoading && <CircularProgress size="1rem" />}
                            </Box>
                        </FormLabel>
                    </FormGroup>
                    <Divider orientation="horizontal" />
                    <FormGroup>
                        <FormLabel>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                                <NotificationsActiveRoundedIcon />
                                <Typography>Påminnelse om time</Typography>
                                <Switch
                                    checked={reminderActive}
                                    onChange={(_, checked) => handleReminderActiveChanged(checked)}
                                    inputProps={{
                                        "aria-label": "påminnelse-aktiv",
                                    }}
                                />
                                {notificationsConfigLoading && <CircularProgress size="1rem" />}
                            </Box>
                        </FormLabel>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
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
                </FormGroup>
            </Box>
        </Box>
    );
}
