import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import PWAInstallPrompt from "@/components/utils/PWAInstallPrompt";
import { getStoredPWAInstallDismissed } from "@/lib/helpers/storage";

interface PWAInstallContextValue {
    isPWAInstalled: boolean;
    showPWAInstall: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextValue | null>(null);

export default function PWAInstallProvider({ children }: { children: ReactNode }) {
    const [show, setShow] = useState(false);
    const [isPWAInstalled, setIsPWAInstalled] = useState(false);

    useEffect(() => {
        if (!getStoredPWAInstallDismissed()) {
            setShow(true);
        }
    }, []);

    return (
        <PWAInstallContext.Provider value={{ isPWAInstalled, showPWAInstall: () => setShow(true) }}>
            {children}
            <PWAInstallPrompt show={show} onClose={() => setShow(false)} onIsInstalledChanged={setIsPWAInstalled} />
        </PWAInstallContext.Provider>
    );
}

export function usePWAInstall() {
    const context = useContext(PWAInstallContext);
    if (context == null) {
        throw new Error("usePWAInstall must be used within a PWAInstallProvider");
    }
    return context;
}
