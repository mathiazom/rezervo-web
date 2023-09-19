"use client";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider, getInitColorSchemeScript } from "@mui/material";
import { Roboto } from "next/font/google";
import React from "react";

import theme from "@/lib/theme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no" className={roboto.className}>
            {getInitColorSchemeScript()}

            <CssVarsProvider theme={theme} defaultMode={"system"}>
                <CssBaseline enableColorScheme />
                <UserProvider>
                    <body>{children}</body>
                </UserProvider>
            </CssVarsProvider>
        </html>
    );
}
