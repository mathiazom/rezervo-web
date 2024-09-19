import "@/styles/globals.css";
import "@/styles/animations.css";
import "@/components/schedule/class/ClassCard.css";

import { UserProvider } from "@auth0/nextjs-auth0/client";
import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

import theme from "@/lib/theme";
import { checkSantaTime } from "@/lib/utils/santaUtils";

function MyApp({ Component, pageProps }: AppProps) {
    // force client rendering (https://reactjs.org/link/uselayouteffect-ssr)
    const [showSnow, setShowSnow] = useState(false);
    useEffect(() => setShowSnow(checkSantaTime()), []);

    return (
        <CssVarsProvider theme={theme} defaultMode={"system"}>
            <CssBaseline enableColorScheme />
            <UserProvider>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                    {showSnow && (
                        <Snowfall
                            speed={[0.5, 1.0]}
                            wind={[0, 0.5]}
                            style={{
                                zIndex: 2412,
                                position: "fixed",
                                width: "100vw",
                                height: "100vh",
                            }}
                        />
                    )}
                    <Component {...pageProps} />
                </LocalizationProvider>
            </UserProvider>
        </CssVarsProvider>
    );
}

export default MyApp;
