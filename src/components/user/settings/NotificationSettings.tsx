import {
    AlarmRounded,
    EventAvailableRounded,
    GroupRounded,
    Notifications,
    SvgIconComponent,
    Vibration,
} from "@mui/icons-material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Box, Collapse, MenuItem, Select, SvgIcon, Switch, TextField, ToggleButton, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { DateTime } from "luxon";
import { ReactNode, useEffect, useState } from "react";

import SlackSvgIcon from "@/components/utils/SlackSvgIcon";
import SubHeader from "@/components/utils/SubHeader";
import { DEFAULT_REMINDER_HOURS, MAX_REMINDER_HOURS, MIN_REMINDER_HOURS } from "@/lib/consts";
import { LocalizedDateTime } from "@/lib/helpers/date";
import { useFeatures } from "@/lib/hooks/useFeatures";
import { usePreferences } from "@/lib/hooks/usePreferences";
import { usePushSubscription } from "@/lib/pushSubscriptionProvider";
import { vars } from "@/lib/theme";
import { AllowedTimeWindow, HourAndMinute, NotificationsConfig, PushNotificationGrants } from "@/types/openapi";

const DEFAULT_NOTIFICATIONS: NotificationsConfig = {
    reminderSlack: false,
    reminderHoursBefore: DEFAULT_REMINDER_HOURS,
    reminderAllowedTimeWindow: null,
};

const DEFAULT_REMINDER_WINDOW: AllowedTimeWindow = {
    notBefore: { hour: 8, minute: 0 },
    notAfter: { hour: 21, minute: 0 },
};

function NotificationSettings() {
    const {
        grants,
        isLoading: subscriptionIsLoading,
        isSupported: isWebPushSupported,
        setGrants,
    } = usePushSubscription();

    const { features } = useFeatures();
    const slackConnected = features?.slackConnected ?? false;

    const { preferences, putPreferences } = usePreferences();
    const [notifications, setNotifications] = useState<NotificationsConfig>(() => ({
        ...DEFAULT_NOTIFICATIONS,
        ...preferences?.notifications,
    }));

    useEffect(() => {
        if (preferences?.notifications != null) {
            setNotifications({ ...DEFAULT_NOTIFICATIONS, ...preferences.notifications });
        }
    }, [preferences?.notifications]);

    function updateNotifications(patch: Partial<NotificationsConfig>) {
        const next = { ...notifications, ...patch };
        setNotifications(next);
        void putPreferences({ ...preferences, notifications: next });
    }

    function setPushGrant(category: keyof PushNotificationGrants, enabled: boolean) {
        void setGrants({ ...grants, [category]: enabled });
    }

    const pushDisabled = !isWebPushSupported || subscriptionIsLoading;
    const reminderSlack = notifications.reminderSlack ?? false;
    const reminderActive = grants.reminder || (slackConnected && reminderSlack);

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <SubHeader
                title={"Varslinger"}
                description={"Velg hva du vil varsles om"}
                startIcon={<Notifications fontSize={"small"} />}
            />
            {!isWebPushSupported && !subscriptionIsLoading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                    <ErrorRoundedIcon color={"error"} fontSize={"small"} />
                    <Typography variant={"body2"}>Nettleseren din støtter ikke push-varsler</Typography>
                </Box>
            )}
            <CategoryRow
                icon={EventAvailableRounded}
                label={"Bookinger"}
                description={"Få varsel når timer bookes, eller hvis booking feiler"}
                slackConnected={slackConnected}
                push={{
                    checked: grants.booking,
                    disabled: pushDisabled,
                    onChange: (enabled) => setPushGrant("booking", enabled),
                }}
            />
            <CategoryRow
                icon={GroupRounded}
                label={"Venneaktivitet"}
                description={"Få varsel når venner booker eller avbooker timer som du er påmeldt"}
                slackConnected={slackConnected}
                push={{
                    checked: grants.community,
                    disabled: pushDisabled,
                    onChange: (enabled) => setPushGrant("community", enabled),
                }}
            />
            <CategoryRow
                icon={AlarmRounded}
                label={"Påminnelser"}
                description={"Få en påminnelse før timene dine starter"}
                slackConnected={slackConnected}
                push={{
                    checked: grants.reminder,
                    disabled: pushDisabled,
                    onChange: (enabled) => setPushGrant("reminder", enabled),
                }}
                slack={
                    slackConnected
                        ? {
                              checked: reminderSlack,
                              onChange: (enabled) => updateNotifications({ reminderSlack: enabled }),
                          }
                        : undefined
                }
            >
                <Collapse in={reminderActive} unmountOnExit>
                    <ReminderConfig notifications={notifications} onChange={updateNotifications} />
                </Collapse>
            </CategoryRow>
        </Box>
    );
}

type Channel = "push" | "slack";

interface ChannelBinding {
    checked: boolean;
    disabled?: boolean;
    onChange: (enabled: boolean) => void;
}

const CHANNEL_META: Record<Channel, { label: string; icon: ReactNode }> = {
    slack: {
        label: "Slack",
        icon: (
            <SvgIcon>
                <SlackSvgIcon />
            </SvgIcon>
        ),
    },
    push: { label: "Push", icon: <Vibration /> },
};

function CategoryRow({
    icon: Icon,
    label,
    description,
    slackConnected,
    push,
    slack,
    children,
}: {
    icon: SvgIconComponent;
    label: string;
    description: string;
    slackConnected: boolean;
    push: ChannelBinding;
    slack?: ChannelBinding | undefined;
    children?: ReactNode;
}) {
    const active = push.checked || (slack?.checked ?? false);

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                <Icon
                    fontSize={"small"}
                    sx={{
                        color: active ? "primary.main" : "text.disabled",
                        transition: "color 0.2s ease",
                        flexShrink: 0,
                    }}
                />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                        variant={"body2"}
                        sx={{
                            fontWeight: 500,
                            lineHeight: 1.3,
                            color: active ? "text.primary" : "text.secondary",
                        }}
                    >
                        {label}
                    </Typography>
                    <Typography
                        variant={"caption"}
                        sx={{
                            display: "block",
                            mt: 0.25,
                            maxWidth: "43ch",
                            color: "text.secondary",
                            lineHeight: 1.3,
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
                {slackConnected ? (
                    <Box
                        role={"group"}
                        aria-label={label}
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-end", sm: "center" },
                            gap: 0.75,
                            flexShrink: 0,
                        }}
                    >
                        {slack != null && <ChannelToggleButton channel={"slack"} binding={slack} />}
                        <ChannelToggleButton channel={"push"} binding={push} />
                    </Box>
                ) : (
                    <Switch
                        size={"small"}
                        checked={push.checked}
                        disabled={push.disabled ?? false}
                        onChange={(_, enabled) => push.onChange(enabled)}
                        slotProps={{ input: { "aria-label": label } }}
                        sx={{ flexShrink: 0 }}
                    />
                )}
            </Box>
            {children}
        </Box>
    );
}

function ChannelToggleButton({ channel, binding }: { channel: Channel; binding: ChannelBinding }) {
    const { label, icon } = CHANNEL_META[channel];
    return (
        <ToggleButton
            value={channel}
            color={"primary"}
            size={"small"}
            selected={binding.checked}
            disabled={binding.disabled ?? false}
            onChange={() => binding.onChange(!binding.checked)}
            sx={{
                gap: 0.75,
                px: 1.5,
                borderRadius: 5,
                textTransform: "none",
                fontWeight: 500,
                lineHeight: 1,
                color: "text.secondary",
                transition: "all 0.2s ease",
                "& .MuiSvgIcon-root": { fontSize: "1.125rem" },
            }}
        >
            {icon}
            {label}
        </ToggleButton>
    );
}

type ReminderUnit = "hours" | "minutes";

function unitFromHours(hoursBefore: number): ReminderUnit {
    if (hoursBefore < 2 || (hoursBefore * 100) % 1 !== 0) {
        return "minutes";
    }
    return "hours";
}

function formatTimeBefore(hoursBefore: number, unit: ReminderUnit): string {
    return (unit === "minutes" ? Math.round(hoursBefore * 60) : hoursBefore).toString();
}

function dateTimeFromHourAndMinute(hourAndMinute: HourAndMinute) {
    return LocalizedDateTime.fromObject({
        hour: hourAndMinute.hour,
        minute: hourAndMinute.minute,
    });
}

function ReminderConfig({
    notifications,
    onChange,
}: {
    notifications: NotificationsConfig;
    onChange: (patch: Partial<NotificationsConfig>) => void;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                ml: 1.25,
                pt: 0.5,
                pb: 1,
                pl: 2.5,
                borderLeft: (theme) => `2px solid ${vars(theme).palette.divider}`,
            }}
        >
            <ReminderTimeBeforeRow
                hoursBefore={notifications.reminderHoursBefore ?? DEFAULT_REMINDER_HOURS}
                onChange={(reminderHoursBefore) => onChange({ reminderHoursBefore })}
            />
            <ReminderTimeWindowRow
                timeWindow={notifications.reminderAllowedTimeWindow ?? null}
                onChange={(reminderAllowedTimeWindow) => onChange({ reminderAllowedTimeWindow })}
            />
        </Box>
    );
}

function ReminderTimeBeforeRow({
    hoursBefore,
    onChange,
}: {
    hoursBefore: number;
    onChange: (hoursBefore: number) => void;
}) {
    const [inputValue, setInputValue] = useState(() => formatTimeBefore(hoursBefore, unitFromHours(hoursBefore)));
    const [unit, setUnit] = useState<ReminderUnit>(() => unitFromHours(hoursBefore));

    function commit(rawInput: string, nextUnit: ReminderUnit) {
        const trimmed = rawInput.trim();
        const parsed = Number(trimmed);
        if (trimmed === "" || Number.isNaN(parsed) || parsed < 0) {
            const storedUnit = unitFromHours(hoursBefore);
            setUnit(storedUnit);
            setInputValue(formatTimeBefore(hoursBefore, storedUnit));
            return;
        }
        const amount = nextUnit === "minutes" ? Math.round(parsed) : parsed;
        const nextHours = Math.max(
            MIN_REMINDER_HOURS,
            Math.min(MAX_REMINDER_HOURS, nextUnit === "minutes" ? amount / 60 : amount),
        );
        setInputValue(formatTimeBefore(nextHours, nextUnit));
        onChange(nextHours);
    }

    return (
        <ReminderRow
            label={"Tid før start"}
            description={"Hvor lenge før timen påminnelsen sendes"}
            control={
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <TextField
                        value={inputValue}
                        onChange={({ target: { value } }) => setInputValue(value)}
                        onBlur={() => commit(inputValue, unit)}
                        sx={{ width: "4rem" }}
                        size={"small"}
                        slotProps={{ htmlInput: { inputMode: "numeric" } }}
                    />
                    <Select
                        value={unit}
                        onChange={({ target: { value } }) => {
                            const nextUnit = value as ReminderUnit;
                            setUnit(nextUnit);
                            commit(inputValue, nextUnit);
                        }}
                        size={"small"}
                    >
                        <MenuItem value={"hours"}>timer</MenuItem>
                        <MenuItem value={"minutes"}>minutter</MenuItem>
                    </Select>
                </Box>
            }
        />
    );
}

function ReminderTimeWindowRow({
    timeWindow,
    onChange,
}: {
    timeWindow: AllowedTimeWindow | null;
    onChange: (timeWindow: AllowedTimeWindow | null) => void;
}) {
    const effectiveWindow = timeWindow ?? DEFAULT_REMINDER_WINDOW;

    function setBoundary(key: "notBefore" | "notAfter", value: DateTime | null) {
        if (value == null) return;
        onChange({ ...effectiveWindow, [key]: { hour: value.hour, minute: value.minute } });
    }

    return (
        <ReminderRow
            label={"Tillatt tidsrom"}
            description={"Begrens utsending av påminnelser til et bestemt tidsrom"}
            noWrap
            control={
                <Switch
                    size={"small"}
                    checked={timeWindow != null}
                    onChange={(_, checked) => onChange(checked ? effectiveWindow : null)}
                    slotProps={{ input: { "aria-label": "Tillatt tidsrom" } }}
                />
            }
        >
            <Collapse in={timeWindow != null} unmountOnExit>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.75,
                        mt: 1.5,
                        pl: 2,
                        borderLeft: (theme) =>
                            `2px solid color-mix(in srgb, ${vars(theme).palette.divider} 55%, transparent)`,
                    }}
                >
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <TimePicker
                            value={dateTimeFromHourAndMinute(effectiveWindow.notBefore)}
                            onChange={(value) => setBoundary("notBefore", value)}
                            sx={{ width: "7rem" }}
                            slotProps={{ textField: { size: "small" } }}
                        />
                        <Typography sx={{ color: "text.secondary" }}>–</Typography>
                        <TimePicker
                            value={dateTimeFromHourAndMinute(effectiveWindow.notAfter)}
                            onChange={(value) => setBoundary("notAfter", value)}
                            sx={{ width: "7rem" }}
                            slotProps={{ textField: { size: "small" } }}
                        />
                    </Box>
                    <Typography variant={"caption"} sx={{ display: "block", color: "text.secondary", lineHeight: 1.4 }}>
                        Påminnelser som ville havnet utenfor tidsrommet, sendes tidligere, for eksempel kvelden før
                    </Typography>
                </Box>
            </Collapse>
        </ReminderRow>
    );
}

function ReminderRow({
    label,
    description,
    control,
    children,
    noWrap = false,
}: {
    label: string;
    description?: string;
    control?: ReactNode;
    children?: ReactNode;
    noWrap?: boolean;
}) {
    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    rowGap: noWrap ? 0 : 1,
                    flexWrap: noWrap ? "nowrap" : "wrap",
                }}
            >
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant={"body2"} sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                        {label}
                    </Typography>
                    {description != null && (
                        <Typography
                            variant={"caption"}
                            sx={{ display: "block", color: "text.secondary", lineHeight: 1.3, mt: 0.25 }}
                        >
                            {description}
                        </Typography>
                    )}
                </Box>
                {control != null && <Box sx={{ flexShrink: 0 }}>{control}</Box>}
            </Box>
            {children}
        </Box>
    );
}

export default NotificationSettings;
