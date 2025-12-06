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
import { TimePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import { Activity, useEffect, useState } from "react";

import ModalWrapper from "@/components/modals/ModalWrapper";
import CalendarFeed from "@/components/modals/Settings/CalendarFeed";
import Memberships from "@/components/modals/Settings/Memberships/Memberships";
import PushNotifications from "@/components/modals/Settings/PushNotifications";
import SwitchWrapper from "@/components/modals/Settings/SwitchWrapper";
import SubHeader from "@/components/modals/SubHeader";
import { INSTALL_PROMPT_DESCRIPTION } from "@/components/utils/PWAInstallPrompt";
import SlackSvgIcon from "@/components/utils/SlackSvgIcon";
import { DEFAULT_REMINDER_HOURS, MAX_REMINDER_HOURS, MIN_REMINDER_HOURS } from "@/lib/consts";
import { LocalizedDateTime } from "@/lib/helpers/date";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { isNonEmptyArray } from "@/lib/utils/arrayUtils";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { AllowedTimeWindow, ChainConfig, HourAndMinute, NotificationsConfig, PreferencesPayload } from "@/types/config";
import { Features } from "@/types/features";

// Fix track not visible with "system" color scheme
const Switch = styled(MaterialUISwitch)(({ theme }) => ({
    "& .MuiSwitch-switchBase": {
        "&.Mui-checked": {
            "& + .MuiSwitch-track": {
                "@media (prefers-color-scheme: dark)": {
                    backgroundColor: theme.palette.primary.main,
                },
            },
        },
    },
    "& .MuiSwitch-track": {
        "@media (prefers-color-scheme: dark)": {
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
    const [reminderHoursBeforeLoading, setReminderHoursBeforeLoading] = useState<boolean>(true);
    const [reminderWindowLoading, setReminderWindowLoading] = useState<boolean>(true);
    const [reminderActive, setReminderActive] = useState(preferences?.notifications?.reminderHoursBefore != null);
    const [reminderHoursBefore, setReminderHoursBefore] = useState<number | null>(null);
    const [reminderTimeBeforeInput, setReminderTimeBeforeInput] = useState<string | null>(null);
    const [reminderTimeBeforeInputUnit, setReminderTimeBeforeInputUnit] = useState<ReminderTimeBeforeInputUnit | null>(
        null,
    );
    const [reminderWindowActive, setReminderWindowActive] = useState(
        preferences?.notifications?.reminderAllowedTimeWindow != null,
    );
    const [reminderWindow, setReminderWindow] = useState(
        preferences?.notifications?.reminderAllowedTimeWindow ?? DEFAULT_REMINDER_WINDOW,
    );

    function handleReminderActiveChanged(active: boolean) {
        setReminderActive(active);
        if (active && reminderHoursBefore == null) {
            setReminderHoursBefore(DEFAULT_REMINDER_HOURS);
            setReminderTimeBeforeInput(DEFAULT_REMINDER_HOURS.toString());
            setReminderTimeBeforeInputUnit(ReminderTimeBeforeInputUnit.HOURS);
        }
        onNotificationsConfigChanged({
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
            reminderHoursBefore: reminderActive ? newReminderHoursBefore : null,
        });
    }

    function handleReminderWindowActiveChanged(active: boolean) {
        setReminderWindowActive(active);
        onNotificationsConfigChanged({
            reminderAllowedTimeWindow: active ? reminderWindow : null,
        });
    }

    function handleReminderWindowNotBeforeChanged(notBefore: DateTime | null) {
        if (notBefore == null) return;
        handleReminderWindowChanged({
            ...reminderWindow,
            notBefore: {
                hour: notBefore.hour,
                minute: notBefore.minute,
            },
        });
    }

    function handleReminderWindowNotAfterChanged(notAfter: DateTime | null) {
        if (notAfter == null) return;
        handleReminderWindowChanged({
            ...reminderWindow,
            notAfter: {
                hour: notAfter.hour,
                minute: notAfter.minute,
            },
        });
    }

    function handleReminderWindowChanged(window: AllowedTimeWindow) {
        setReminderWindow(window);
        onNotificationsConfigChanged({
            reminderAllowedTimeWindow: window,
        });
    }

    function onNotificationsConfigChanged(notificationsConfig: Partial<NotificationsConfig>) {
        if (notificationsConfig.reminderHoursBefore !== undefined) {
            setReminderHoursBeforeLoading(true);
        }
        if (notificationsConfig.reminderAllowedTimeWindow !== undefined) {
            setReminderWindowLoading(true);
        }
        return putPreferences({
            ...preferences,
            notifications: {
                ...(preferences?.notifications ?? {}),
                ...notificationsConfig,
            },
        } as PreferencesPayload).then(() => {
            setReminderHoursBeforeLoading(false);
            setReminderWindowLoading(false);
        });
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
            setReminderHoursBeforeLoading(false);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [preferences?.notifications?.reminderHoursBefore],
    );

    useEffect(() => {
        setReminderWindowLoading(false);
        const newWindow = preferences?.notifications?.reminderAllowedTimeWindow;
        if (newWindow == null) {
            setReminderWindowActive(false);
            return;
        }
        setReminderWindowActive(true);
        setReminderWindow(newWindow);
    }, [preferences?.notifications?.reminderAllowedTimeWindow]);

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
                {isNonEmptyArray(chainProfiles) && (
                    <Memberships chainProfiles={chainProfiles} chainConfigs={chainConfigs} />
                )}
                <Divider sx={{ mt: 1 }} />
                <PushNotifications />
                <FormGroup>
                    <Divider orientation="horizontal" />
                    <Activity mode={features?.classReminderNotifications ? "visible" : "hidden"}>
                        <FormGroup sx={{ py: 2 }}>
                            <SubHeader
                                title={"Slack"}
                                startIcon={
                                    <SvgIcon fontSize={"small"} sx={{ color: theme.palette.primary.contrastText }}>
                                        <SlackSvgIcon />
                                    </SvgIcon>
                                }
                            />
                            <FormLabel disabled={reminderHoursBeforeLoading}>
                                <SwitchWrapper label={"Påminnelse om time"} loading={reminderHoursBeforeLoading}>
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
                                        disabled={
                                            reminderHoursBeforeLoading || !reminderActive || reminderHoursBefore == null
                                        }
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
                                <FormLabel disabled={reminderHoursBeforeLoading || !reminderActive}>
                                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                        <Select
                                            disabled={
                                                reminderHoursBeforeLoading ||
                                                !reminderActive ||
                                                reminderHoursBefore == null
                                            }
                                            value={
                                                reminderTimeBeforeInputUnit ??
                                                reminderTimeBeforeInputUnitFromHours(
                                                    reminderHoursBefore ?? DEFAULT_REMINDER_HOURS,
                                                )
                                            }
                                            onChange={({ target: { value } }) => {
                                                handleReminderHoursUnitChanged(value as ReminderTimeBeforeInputUnit);
                                            }}
                                            inputProps={{ "aria-label": "enhet" }}
                                            size={"small"}
                                        >
                                            <MenuItem value={ReminderTimeBeforeInputUnit.HOURS}>timer</MenuItem>
                                            <MenuItem value={ReminderTimeBeforeInputUnit.MINUTES}>minutter</MenuItem>
                                        </Select>
                                        <Typography>før start</Typography>
                                    </Box>
                                </FormLabel>
                            </Box>
                            <FormLabel disabled={reminderWindowLoading}>
                                <SwitchWrapper label={"Varslingsvindu"} loading={reminderWindowLoading}>
                                    <Switch
                                        checked={reminderWindowActive}
                                        onChange={(_, checked) => handleReminderWindowActiveChanged(checked)}
                                    />
                                </SwitchWrapper>
                            </FormLabel>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", pb: 1 }}>
                                <FormControl>
                                    <TimePicker
                                        disabled={
                                            reminderWindowLoading || !reminderWindowActive || reminderWindow == null
                                        }
                                        value={dateTimeFromHourAndMinute(
                                            reminderWindow?.notBefore ?? DEFAULT_REMINDER_WINDOW.notBefore,
                                        )}
                                        onChange={(value) => handleReminderWindowNotBeforeChanged(value)}
                                        sx={{ width: "7rem" }}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                            },
                                        }}
                                    />
                                </FormControl>
                                <Typography variant="body1">-</Typography>
                                <FormControl>
                                    <TimePicker
                                        disabled={
                                            reminderWindowLoading || !reminderWindowActive || reminderWindow == null
                                        }
                                        value={dateTimeFromHourAndMinute(
                                            reminderWindow?.notAfter ?? DEFAULT_REMINDER_WINDOW.notAfter,
                                        )}
                                        onChange={(value) => handleReminderWindowNotAfterChanged(value)}
                                        sx={{ width: "7rem" }}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                            },
                                        }}
                                    />
                                </FormControl>
                            </Box>
                        </FormGroup>
                        <Divider />
                    </Activity>
                    <CalendarFeed />
                </FormGroup>
            </Box>
        </ModalWrapper>
    );
}

const DEFAULT_REMINDER_WINDOW: AllowedTimeWindow = {
    notBefore: {
        hour: 8,
        minute: 0,
    },
    notAfter: {
        hour: 21,
        minute: 0,
    },
};

function dateTimeFromHourAndMinute(hourAndMinute: HourAndMinute) {
    return LocalizedDateTime.fromObject({
        hour: hourAndMinute.hour,
        minute: hourAndMinute.minute,
    });
}
