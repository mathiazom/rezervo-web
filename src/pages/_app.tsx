import "@/styles/globals.css";
import "@/styles/animations.css";
import "@/components/schedule/class/ClassCard.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import type { AppProps } from "next/app";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import React, { useEffect, useState } from "react";
import { Snowfall } from "react-snowfall";

import AuthProvider from "@/lib/authProvider";
import theme from "@/lib/theme";
import { checkSantaTime } from "@/lib/utils/santaUtils";

function MyApp({ Component, pageProps }: AppProps) {
    // force client rendering (https://reactjs.org/link/uselayouteffect-ssr)
    const [showSnow, setShowSnow] = useState(false);
    useEffect(() => setShowSnow(checkSantaTime()), []);

    return (
        <ThemeProvider theme={theme} defaultMode={"system"}>
            <CssBaseline enableColorScheme />
            <AuthProvider>
                <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="nb-NO">
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
                    <NuqsAdapter>
                        <Component {...pageProps} />
                    </NuqsAdapter>
                </LocalizationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default MyApp;
