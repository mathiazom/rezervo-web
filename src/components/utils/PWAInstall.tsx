"use client";
import { PWAInstallAttributes, PWAInstallElement } from "@khmyznikov/pwa-install";
import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef } from "react";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            "pwa-install": DetailedHTMLProps<HTMLAttributes<PWAInstallElement>, PWAInstallElement>;
        }
    }
}

const InstallationPrompt = (props: PWAInstallAttributes) => {
    const pwaInstallRef = useRef<PWAInstallElement>(null);

    useEffect(() => {
        import("@khmyznikov/pwa-install");
    });

    return <pwa-install ref={pwaInstallRef} {...props}></pwa-install>;
};

export default InstallationPrompt;
