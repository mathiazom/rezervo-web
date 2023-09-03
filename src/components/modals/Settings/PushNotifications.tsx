import { Vibration } from "@mui/icons-material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Box, FormGroup, FormLabel, Switch, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { usePreferences } from "@/hooks/usePreferences";

const base64ToUint8Array = (base64: string) => {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(b64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

const PushNotifications = () => {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [webPushSupported, setWebPushSupported] = useState(false);

    const { preferences, putPreferences } = usePreferences();

    const webPushPublicKey = process.env["NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY"];

    if (!webPushPublicKey) {
        throw new Error("Web push public key must be set as an environment variable");
    }

    useEffect(() => {
        navigator.serviceWorker.ready.then((reg) => {
            if (reg.pushManager) {
                setWebPushSupported(true);
                reg.pushManager.getSubscription().then((sub) => {
                    if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
                        setSubscription(sub);
                    }
                });
            }
            setRegistration(reg);
        });
    }, []);

    const subscribe = async () => {
        if (registration === null) {
            throw new Error("Service worker is not registered");
        }
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64ToUint8Array(webPushPublicKey),
        });
        setSubscription(sub);
        await putPreferences({
            notifications: {
                reminder_hours_before: preferences?.notifications?.reminder_hours_before ?? null,
                push_notification_subscription: sub,
            },
        });
    };

    const unsubscribe = async () => {
        if (subscription === null) {
            return;
        }
        await subscription.unsubscribe();
        setSubscription(null);
        await putPreferences({
            notifications: {
                reminder_hours_before: preferences?.notifications?.reminder_hours_before ?? null,
                push_notification_subscription: null,
            },
        });
    };

    return (
        <>
            <FormGroup>
                <FormLabel disabled={!webPushSupported}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                        <Vibration />
                        <Typography
                            sx={{
                                userSelect: "none",
                            }}
                        >
                            Push-varsler for booking
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "right",
                                flexGrow: 1,
                            }}
                        >
                            <Switch
                                disabled={!webPushSupported}
                                checked={subscription !== null}
                                onChange={(_, checked) => (checked ? subscribe() : unsubscribe())}
                                inputProps={{
                                    "aria-label": "push-varsler-aktiv",
                                }}
                            />
                        </Box>
                    </Box>
                </FormLabel>
                {!webPushSupported && (
                    <FormLabel>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
                            <ErrorRoundedIcon color={"error"} />
                            <Typography>Nettleseren din støtter ikke push-varsler</Typography>
                        </Box>
                    </FormLabel>
                )}
            </FormGroup>
        </>
    );
};
export default PushNotifications;
