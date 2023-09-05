import "@/styles/globals.css";
import "@/styles/animations.css";
import "@/components/schedule/class/ClassCard.css";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import type { AppProps } from "next/app";
import React from "react";

import theme from "@/lib/theme";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <CssVarsProvider theme={theme} defaultMode={"system"}>
            <CssBaseline enableColorScheme />
            <UserProvider>
                <Component {...pageProps} />
            </UserProvider>
        </CssVarsProvider>
    );
}

export default MyApp;
