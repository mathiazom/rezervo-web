import { SettingsRounded } from "@mui/icons-material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import {
    Box,
    CircularProgress,
    Divider,
    FormControl,
    FormGroup,
    FormLabel,
    MenuItem,
    Select,
    styled,
    Switch as MaterialUISwitch,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import CalendarFeed from "@/components/modals/Settings/CalendarFeed";
import Memberships from "@/components/modals/Settings/Memberships/Memberships";
import PushNotifications from "@/components/modals/Settings/PushNotifications";
import { DEFAULT_REMINDER_HOURS, MAX_REMINDER_HOURS, MIN_REMINDER_HOURS } from "@/lib/consts";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig, NotificationsConfig, PreferencesPayload } from "@/types/config";
import { Features } from "@/types/features";

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

enum ReminderTimeBeforeInputUnit {
    HOURS = "hours",
    MINUTES = "minutes",
}

export default function Settings({
    chainProfiles,
    chainConfigs,
    features,
}: {
    chainProfiles: ChainProfile[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    features: Features | undefined;
}) {
    const { preferences, putPreferences } = usePreferences();
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);
    const [reminderActive, setReminderActive] = useState(preferences?.notifications?.reminder_hours_before != null);
    const [reminderHoursBefore, setReminderHoursBefore] = useState<number | null>(null);
    const [reminderTimeBeforeInput, setReminderTimeBeforeInput] = useState<string | null>(null);
    const [reminderTimeBeforeInputUnit, setReminderTimeBeforeInputUnit] = useState<ReminderTimeBeforeInputUnit | null>(
        null,
    );

    function handleReminderActiveChanged(active: boolean) {
        setReminderActive(active);
        if (active && reminderHoursBefore == null) {
            setReminderHoursBefore(DEFAULT_REMINDER_HOURS);
            setReminderTimeBeforeInput(DEFAULT_REMINDER_HOURS.toString());
            setReminderTimeBeforeInputUnit(ReminderTimeBeforeInputUnit.HOURS);
        }
        onNotificationsConfigChanged({
            ...(preferences?.notifications ?? {}),
            reminder_hours_before: active ? reminderHoursBefore ?? DEFAULT_REMINDER_HOURS : null,
        });
    }

    function reminderTimeBeforeInputUnitFromHours(reminderHoursBefore: number): ReminderTimeBeforeInputUnit {
        if (reminderHoursBefore < 2 || (reminderHoursBefore * 100) % 1 !== 0) {
            return ReminderTimeBeforeInputUnit.MINUTES;
        }
        return ReminderTimeBeforeInputUnit.HOURS;
    }

    function handleReminderHoursUnitChanged(unit: ReminderTimeBeforeInputUnit) {
        setReminderTimeBeforeInputUnit(unit);
        if (reminderHoursBefore != null && reminderTimeBeforeInput != null) {
            handleReminderHoursChanged(reminderTimeBeforeInput, unit);
        }
    }

    function handleReminderHoursChanged(reminderTimeBeforeInput: string, unit: ReminderTimeBeforeInputUnit) {
        const reminderTimeBeforeTrimmed = reminderTimeBeforeInput.trim();
        let newReminderTimeBefore = Number(reminderTimeBeforeTrimmed);
        if (
            Number.isNaN(newReminderTimeBefore) ||
            Number.isNaN(parseFloat(reminderTimeBeforeTrimmed)) ||
            newReminderTimeBefore < 0
        ) {
            const newReminderHoursBefore = reminderHoursBefore ?? DEFAULT_REMINDER_HOURS;
            const unit = reminderTimeBeforeInputUnitFromHours(newReminderHoursBefore);
            setReminderTimeBeforeInput(
                (unit === ReminderTimeBeforeInputUnit.MINUTES
                    ? newReminderHoursBefore * 60
                    : newReminderHoursBefore
                ).toString(),
            );
            setReminderTimeBeforeInputUnit(unit);
            return;
        }
        if (unit === ReminderTimeBeforeInputUnit.MINUTES) {
            newReminderTimeBefore = Math.round(newReminderTimeBefore);
        }
        let newReminderHoursBefore =
            unit === ReminderTimeBeforeInputUnit.MINUTES ? newReminderTimeBefore / 60 : newReminderTimeBefore;
        newReminderHoursBefore = Math.max(MIN_REMINDER_HOURS, Math.min(MAX_REMINDER_HOURS, newReminderHoursBefore));
        setReminderHoursBefore(newReminderHoursBefore);
        setReminderTimeBeforeInput(
            (unit === ReminderTimeBeforeInputUnit.MINUTES
                ? newReminderHoursBefore * 60
                : newReminderHoursBefore
            ).toString(),
        );
        onNotificationsConfigChanged({
            ...(preferences?.notifications ?? {}),
            reminder_hours_before: reminderActive ? newReminderHoursBefore : null,
        });
    }

    function onNotificationsConfigChanged(notificationsConfig: NotificationsConfig) {
        setNotificationsConfigLoading(true);
        return putPreferences({
            ...preferences,
            notifications: notificationsConfig,
        } as PreferencesPayload).then(() => setNotificationsConfigLoading(false));
    }

    useEffect(
        () => {
            const newReminderHoursBefore = preferences?.notifications?.reminder_hours_before;
            if (newReminderHoursBefore == null) {
                setReminderActive(false);
                return;
            }
            setReminderActive(true);
            setReminderHoursBefore(newReminderHoursBefore);
            let unit = reminderTimeBeforeInputUnit;
            if (reminderTimeBeforeInput == null) {
                // assume this is initial load and convert to the appropriate unit
                unit = reminderTimeBeforeInputUnitFromHours(newReminderHoursBefore);
                setReminderTimeBeforeInputUnit(unit);
            }
            setReminderTimeBeforeInput(
                (unit === ReminderTimeBeforeInputUnit.MINUTES
                    ? Math.round(newReminderHoursBefore * 60)
                    : newReminderHoursBefore
                ).toString(),
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [preferences?.notifications?.reminder_hours_before],
    );

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90%",
                maxHeight: "80%",
                overflowY: "auto",
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
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={1} paddingBottom={2}>
                <SettingsRounded />
                <Typography variant="h6" component="h2">
                    Innstillinger
                </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Memberships chainProfiles={chainProfiles} chainConfigs={chainConfigs} />
                <Divider sx={{ my: 1 }} />
                <PushNotifications />
                <FormGroup>
                    <Divider orientation="horizontal" />
                    {features && features.class_reminder_notifications && (
                        <>
                            <FormGroup sx={{ py: 2 }}>
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
                                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", ml: "33px", pb: 1 }}>
                                    <FormControl>
                                        <TextField
                                            disabled={!reminderActive || reminderHoursBefore == null}
                                            inputProps={{ inputMode: "numeric" }}
                                            value={
                                                reminderTimeBeforeInput ??
                                                (reminderHoursBefore ?? DEFAULT_REMINDER_HOURS).toString()
                                            }
                                            onChange={({ target: { value } }) => setReminderTimeBeforeInput(value)}
                                            onBlur={() =>
                                                reminderTimeBeforeInput != null &&
                                                reminderTimeBeforeInputUnit != null &&
                                                handleReminderHoursChanged(
                                                    reminderTimeBeforeInput,
                                                    reminderTimeBeforeInputUnit,
                                                )
                                            }
                                            sx={{ width: "4rem" }}
                                            size={"small"}
                                        />
                                    </FormControl>
                                    <FormLabel disabled={!reminderActive}>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                            <Select
                                                disabled={!reminderActive || reminderHoursBefore == null}
                                                value={
                                                    reminderTimeBeforeInputUnit ??
                                                    reminderTimeBeforeInputUnitFromHours(
                                                        reminderHoursBefore ?? DEFAULT_REMINDER_HOURS,
                                                    )
                                                }
                                                onChange={({ target: { value } }) => {
                                                    handleReminderHoursUnitChanged(
                                                        value as ReminderTimeBeforeInputUnit,
                                                    );
                                                }}
                                                inputProps={{ "aria-label": "Without label" }}
                                                size={"small"}
                                            >
                                                <MenuItem value={ReminderTimeBeforeInputUnit.HOURS}>timer</MenuItem>
                                                <MenuItem value={ReminderTimeBeforeInputUnit.MINUTES}>
                                                    minutter
                                                </MenuItem>
                                            </Select>
                                            <Typography>før start</Typography>
                                        </Box>
                                    </FormLabel>
                                </Box>
                            </FormGroup>
                            <Divider />
                        </>
                    )}
                    <CalendarFeed />
                </FormGroup>
            </Box>
        </Box>
    );
}
