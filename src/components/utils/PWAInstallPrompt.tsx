import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/dist/pwa-install.react.js";
import React, { forwardRef } from "react";

export const INSTALL_PROMPT_DESCRIPTION =
    "Denne nettsiden har app-funksjonalitet. Legg den til på hjemskjermen for å få enklere tilgang og muligheten til å aktivere push-varsler for booking.";

const PWAInstallPrompt = forwardRef<PWAInstallElement | null>((_, ref) => {
    return <PWAInstall ref={ref} install-description={INSTALL_PROMPT_DESCRIPTION} />;
});

PWAInstallPrompt.displayName = "PWAInstallPrompt";

export default PWAInstallPrompt;
