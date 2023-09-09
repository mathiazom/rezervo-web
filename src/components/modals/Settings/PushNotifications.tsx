import { Vibration } from "@mui/icons-material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Box, CircularProgress, FormGroup, FormLabel, Switch, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import { usePushNotificationSubscription } from "@/lib/hooks/usePushNotificationSubscription";
import { base64ToUint8Array } from "@/lib/utils/base64Utils";

const PushNotifications = () => {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [subscriptionIsLoading, setSubscriptionIsLoading] = useState(true);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isWebPushSupported, setIsWebPushSupported] = useState(false);

    const { subscribeToPush, unsubscribeFromPush, verifySubscription } = usePushNotificationSubscription();

    const webPushPublicKey = process.env["NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY"];

    if (!webPushPublicKey) {
        throw new Error("Web push public key must be set as an environment variable");
    }

    useEffect(() => {
        navigator.serviceWorker.ready.then((reg) => {
            setRegistration(reg);
            if (!reg.pushManager) {
                setSubscriptionIsLoading(false);
                return;
            }
            setIsWebPushSupported(true);
            reg.pushManager.getSubscription().then((sub) => {
                if (!sub || (sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
                    setSubscriptionIsLoading(false);
                    return;
                }
                verifySubscription(sub).then((isValid) => {
                    if (isValid) {
                        setSubscription(sub);
                    }
                    setSubscriptionIsLoading(false);
                });
            });
        });
    }, [verifySubscription]);

    const subscribe = async () => {
        if (registration === null) {
            throw new Error("Service worker is not registered");
        }
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64ToUint8Array(webPushPublicKey),
        });
        setSubscription(sub);
        await subscribeToPush(sub);
    };

    const unsubscribe = async () => {
        if (subscription === null) {
            return;
        }
        await subscription.unsubscribe();
        setSubscription(null);
        await unsubscribeFromPush(subscription);
    };

    return (
        <>
            <FormGroup>
                <FormLabel disabled={!isWebPushSupported || subscriptionIsLoading}>
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
                            {subscriptionIsLoading ? (
                                <CircularProgress size={22} thickness={4} sx={{ margin: "1rem" }} />
                            ) : (
                                <Switch
                                    disabled={!isWebPushSupported}
                                    checked={subscription !== null}
                                    onChange={(_, checked) => (checked ? subscribe() : unsubscribe())}
                                    inputProps={{
                                        "aria-label": "push-varsler-aktiv",
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </FormLabel>
                {!isWebPushSupported && !subscriptionIsLoading && (
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
