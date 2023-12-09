import { EditRounded } from "@mui/icons-material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import {
    Avatar,
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
    useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import CalendarFeed from "@/components/modals/Settings/CalendarFeed";
import PushNotifications from "@/components/modals/Settings/PushNotifications";
import RippleBadge from "@/components/utils/RippleBadge";
import { DEFAULT_REMINDER_HOURS, MAX_REMINDER_HOURS, MIN_REMINDER_HOURS } from "@/lib/consts";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { useUserConfig } from "@/lib/hooks/useUserConfig";
import { ChainProfile } from "@/types/chain";
import { ChainConfigPayload, NotificationsConfig, PreferencesPayload } from "@/types/config";
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
    chainProfile,
    bookingActive,
    features,
    setBookingActive,
    openChainUserSettings,
}: {
    chainProfile: ChainProfile;
    bookingActive: boolean;
    features: Features | undefined;
    setBookingActive: Dispatch<SetStateAction<boolean>>;
    openChainUserSettings: () => void;
}) {
    const theme = useTheme();
    const { chainUser, chainUserError, chainUserLoading } = useChainUser(chainProfile.identifier);
    const hasChainUser = chainUser !== undefined && chainUserError == undefined && !chainUserLoading;
    const { userConfig, putUserConfig } = useUserConfig(chainProfile.identifier);
    const { preferences, putPreferences } = usePreferences();
    const [bookingActiveLoading, setBookingActiveLoading] = useState(false);
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);
    const [reminderActive, setReminderActive] = useState(preferences?.notifications?.reminder_hours_before != null);
    const [reminderHoursBefore, setReminderHoursBefore] = useState<number | null>(null);
    const [reminderTimeBeforeInput, setReminderTimeBeforeInput] = useState<string | null>(null);
    const [reminderTimeBeforeInputUnit, setReminderTimeBeforeInputUnit] = useState<ReminderTimeBeforeInputUnit | null>(
        null,
    );

    async function onBookingActiveChanged(active: boolean) {
        setBookingActive(active);
        setBookingActiveLoading(true);
        await putUserConfig({
            ...userConfig,
            active: active,
        } as ChainConfigPayload);
        setBookingActiveLoading(false);
    }

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
                    <FormGroup
                        sx={{
                            maxWidth: "100%",
                            paddingBottom: "0.75rem",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: "1rem",
                                backgroundColor: theme.palette.secondaryBackground.default,
                                padding: "1rem 1.25rem",
                                borderRadius: "6px",
                                width: "100%",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <RippleBadge
                                invisible={!hasChainUser}
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                variant={"dot"}
                                rippleColor={"#44b700"}
                            >
                                <Avatar
                                    sx={{ width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 } }}
                                    src={chainProfile.images.common.smallLogo}
                                >
                                    {chainProfile.identifier}
                                </Avatar>
                            </RippleBadge>
                            <Typography
                                noWrap
                                sx={{
                                    flexGrow: 1,
                                    opacity: 0.6,
                                    color: theme.palette.primary.contrastText,
                                }}
                            >
                                {chainUser?.username}
                            </Typography>
                            <FormLabel>
                                <IconButton onClick={() => openChainUserSettings()}>
                                    <EditRounded />
                                </IconButton>
                            </FormLabel>
                        </Box>
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                                <PlayCircleOutlineRoundedIcon />
                                <Typography
                                    sx={{
                                        userSelect: "none",
                                    }}
                                >
                                    Automatisk booking
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
                    <PushNotifications />
                    <Divider orientation="horizontal" />
                    {features && features.class_reminder_notifications && (
                        <>
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
