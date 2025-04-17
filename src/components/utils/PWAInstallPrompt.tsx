import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/react-legacy";
import { useEffect, useRef } from "react";

import { getStoredPWAInstallDismissed, storePWAInstallDismissed } from "@/lib/helpers/storage";

export const INSTALL_PROMPT_DESCRIPTION =
    "Denne nettsiden har app-funksjonalitet. Legg den til på hjemskjermen for å få enklere tilgang og muligheten til å aktivere push-varsler for booking.";

function PWAInstallPrompt({
    show = true,
    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onClose = () => {},
    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onIsInstalledChanged = () => {},
}: {
    show?: boolean;
    onClose?: () => void;
    onIsInstalledChanged?: (isInstalled: boolean) => void;
}) {
    const pwaInstallRef = useRef<PWAInstallElement | null>(null);

    const isAppleDevice = pwaInstallRef.current?.isAppleMobilePlatform || pwaInstallRef.current?.isAppleDesktopPlatform;
    const isInstalled =
        pwaInstallRef.current?.isUnderStandaloneMode || pwaInstallRef.current?.isInstallAvailable === false;

    useEffect(() => {
        if (show) {
            if (isAppleDevice) {
                pwaInstallRef.current?.showDialog();
            } else {
                pwaInstallRef.current?.install();
            }
        } else {
            pwaInstallRef.current?.hideDialog();
        }
    }, [show, isAppleDevice]);

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
    }, [onClose]);

    useEffect(() => {
        onIsInstalledChanged(isInstalled);
    }, [isInstalled, onIsInstalledChanged]);

    return <PWAInstall ref={pwaInstallRef} install-description={INSTALL_PROMPT_DESCRIPTION} />;
}

export default PWAInstallPrompt;
