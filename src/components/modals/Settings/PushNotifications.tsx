import { Vibration } from "@mui/icons-material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Box, FormGroup, FormLabel, Switch, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import SwitchWrapper from "@/components/modals/Settings/SwitchWrapper";
import SubHeader from "@/components/modals/SubHeader";
import { usePushNotificationSubscription } from "@/lib/hooks/usePushNotificationSubscription";
import { base64ToUint8Array } from "@/lib/utils/base64Utils";

const PushNotifications = () => {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [subscriptionIsLoading, setSubscriptionIsLoading] = useState(true);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isWebPushSupported, setIsWebPushSupported] = useState(false);

    const {
        pushNotificationPublicKey,
        pushNotificationPublicKeyError,
        pushNotificationPublicKeyLoading,
        subscribeToPush,
        unsubscribeFromPush,
        verifySubscription,
    } = usePushNotificationSubscription();

    if (pushNotificationPublicKeyError || (!pushNotificationPublicKey && !pushNotificationPublicKeyLoading)) {
        throw new Error("Web push public key must be set as an environment variable");
    }

    useEffect(() => {
        if (navigator.serviceWorker === undefined) {
            // not available (e.g. outside Secure Context)
            setSubscriptionIsLoading(false);
            return;
        }
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
        if (pushNotificationPublicKey == null) {
            throw new Error("Web push public key is not available");
        }
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64ToUint8Array(pushNotificationPublicKey),
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
                <SubHeader title={"Push-varsler"} startIcon={<Vibration fontSize={"small"} />} />
                <FormLabel disabled={!isWebPushSupported || subscriptionIsLoading}>
                    <SwitchWrapper label={"Bookinger og venneforespørsler"} loading={subscriptionIsLoading}>
                        <Switch
                            disabled={!isWebPushSupported}
                            checked={subscription !== null}
                            onChange={(_, checked) => (checked ? subscribe() : unsubscribe())}
                            inputProps={{
                                "aria-label": "push-varsler-aktiv",
                            }}
                        />
                    </SwitchWrapper>
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
