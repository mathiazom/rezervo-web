import { GetApp, SettingsRounded } from "@mui/icons-material";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    FormControl,
    FormGroup,
    FormLabel,
    MenuItem,
    Select,
    styled,
    SvgIcon,
    Switch as MaterialUISwitch,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import ModalWrapper from "@/components/modals/ModalWrapper";
import CalendarFeed from "@/components/modals/Settings/CalendarFeed";
import Memberships from "@/components/modals/Settings/Memberships/Memberships";
import PushNotifications from "@/components/modals/Settings/PushNotifications";
import SwitchWrapper from "@/components/modals/Settings/SwitchWrapper";
import SubHeader from "@/components/modals/SubHeader";
import { INSTALL_PROMPT_DESCRIPTION } from "@/components/utils/PWAInstallPrompt";
import SlackSvgIcon from "@/components/utils/SlackSvgIcon";
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
    isPWAInstalled,
    showPWAInstall,
}: {
    chainProfiles: ChainProfile[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
    features: Features | undefined;
    isPWAInstalled: boolean;
    showPWAInstall: () => void;
}) {
    const theme = useTheme();

    const { preferences, putPreferences } = usePreferences();
    const [notificationsConfigLoading, setNotificationsConfigLoading] = useState<boolean>(false);
    const [reminderActive, setReminderActive] = useState(preferences?.notifications?.reminderHoursBefore != null);
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
            reminderHoursBefore: active ? (reminderHoursBefore ?? DEFAULT_REMINDER_HOURS) : null,
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
            reminderHoursBefore: reminderActive ? newReminderHoursBefore : null,
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
            const newReminderHoursBefore = preferences?.notifications?.reminderHoursBefore;
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
        [preferences?.notifications?.reminderHoursBefore],
    );

    return (
        <ModalWrapper title={"Innstillinger"} icon={<SettingsRounded />}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {!isPWAInstalled && (
                    <>
                        <Alert severity="info" icon={<GetApp />}>
                            <AlertTitle>
                                Installer <b>rezervo</b> som app
                            </AlertTitle>
                            {INSTALL_PROMPT_DESCRIPTION}
                        </Alert>
                        <Button color={"info"} variant={"outlined"} startIcon={<GetApp />} onClick={showPWAInstall}>
                            Installer
                        </Button>
                    </>
                )}
                <Memberships chainProfiles={chainProfiles} chainConfigs={chainConfigs} />
                <Divider sx={{ mt: 1 }} />
                <PushNotifications />
                <FormGroup>
                    <Divider orientation="horizontal" />
                    {features && features.classReminderNotifications && (
                        <>
                            <FormGroup sx={{ py: 2 }}>
                                <SubHeader
                                    title={"Slack"}
                                    startIcon={
                                        <SvgIcon fontSize={"small"} sx={{ color: theme.palette.primary.contrastText }}>
                                            <SlackSvgIcon />
                                        </SvgIcon>
                                    }
                                />
                                <FormLabel>
                                    <SwitchWrapper label={"Påminnelse om time"} loading={notificationsConfigLoading}>
                                        <Switch
                                            checked={reminderActive}
                                            onChange={(_, checked) => handleReminderActiveChanged(checked)}
                                            inputProps={{
                                                "aria-label": "påminnelse-aktiv",
                                            }}
                                        />
                                    </SwitchWrapper>
                                </FormLabel>
                                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", pb: 1 }}>
                                    <FormControl>
                                        <TextField
                                            disabled={!reminderActive || reminderHoursBefore == null}
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
                                            slotProps={{
                                                htmlInput: { inputMode: "numeric" },
                                            }}
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
        </ModalWrapper>
    );
}
