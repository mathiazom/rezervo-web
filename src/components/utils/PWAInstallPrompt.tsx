import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/dist/pwa-install.react.js";
import React, { useEffect, useRef, useState } from "react";

import { getStoredPWAInstallDismissed, storePWAInstallDismissed } from "@/lib/helpers/storage";

export const INSTALL_PROMPT_DESCRIPTION =
    "Denne nettsiden har app-funksjonalitet. Legg den til på hjemskjermen for å få enklere tilgang og muligheten til å aktivere push-varsler for booking.";

function PWAInstallPrompt({
    show = true,
    onClose = () => {},
    onIsInstalledChanged = () => {},
}: {
    show?: boolean;
    onClose?: () => void;
    onIsInstalledChanged?: (isInstalled: boolean) => void;
}) {
    const pwaInstallRef = useRef<PWAInstallElement | null>(null);

    const [isFirstTimeUsingPWA, setIsFirstTimeUsingPWA] = useState(false);

    useEffect(() => {
        // @ts-expect-error https://github.com/khmyznikov/pwa-install?tab=readme-ov-file#supported-properties-readonly
        const isPWAInstalled = pwaInstallRef.current?.isUnderStandaloneMode === true;

        onIsInstalledChanged(isPWAInstalled || isFirstTimeUsingPWA);
    }, [onIsInstalledChanged, isFirstTimeUsingPWA]);

    useEffect(() => {
        if (show) {
            pwaInstallRef.current?.showDialog();
        } else {
            pwaInstallRef.current?.hideDialog();
        }
    }, [show]);

    useEffect(() => {
        pwaInstallRef.current?.addEventListener("pwa-install-available-event", () => {
            if (getStoredPWAInstallDismissed()) {
                pwaInstallRef.current?.hideDialog();
            }
        });
        pwaInstallRef.current?.addEventListener("pwa-user-choice-result-event", (event) => {
            // @ts-expect-error Missing type in @khmyznikov/pwa-install
            if (event.detail.message === "dismissed") {
                storePWAInstallDismissed();
            }
            onClose();
        });
        // isUnderStandaloneMode is not updated the first time Chrome opens the PWA after install
        pwaInstallRef.current?.addEventListener("pwa-install-success-event", () => {
            setIsFirstTimeUsingPWA(true);
        });
    }, [onClose]);

    return <PWAInstall ref={pwaInstallRef} install-description={INSTALL_PROMPT_DESCRIPTION} />;
}

export default PWAInstallPrompt;
