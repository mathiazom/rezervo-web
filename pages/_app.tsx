import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {createTheme, CssBaseline, ThemeProvider, useMediaQuery} from "@mui/material";
import React from "react";

function MyApp({Component, pageProps}: AppProps) {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                    primary: {
                        light: '#6fbf73',
                        main: '#4caf50',
                        dark: '#357a38',
                        contrastText: '#fff',
                    },
                    secondary: {
                        light: '#ff7961',
                        main: '#f44336',
                        dark: '#ba000d',
                        contrastText: '#000',
                    }
                },
            }),
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Component {...pageProps} />
        </ThemeProvider>
    )
}

export default MyApp
