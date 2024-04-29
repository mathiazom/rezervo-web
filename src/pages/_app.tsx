import "@/styles/globals.css";
import "@/styles/animations.css";
import "@/components/schedule/class/ClassCard.css";

import { CssBaseline, Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
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
            <SessionProvider>
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
            </SessionProvider>
        </CssVarsProvider>
    );
}

export default MyApp;
