"use client";

import { createTheme } from "@mui/material";
// @ts-expect-error: undetected usage below
import { TypeBackground } from "@mui/material/styles/createPalette";

declare module "@mui/material/styles" {
    interface Palette {
        secondaryBackground: Partial<TypeBackground>;
    }

    interface PaletteOptions {
        secondaryBackground?: Partial<TypeBackground>;
    }
}

const theme = createTheme({
    cssVariables: true,
    typography: {
        fontFamily: "var(--font-roboto)",
    },
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    light: "#6fbf73",
                    main: "#4caf50",
                    dark: "#357a38",
                    contrastText: "#000",
                },
                secondary: {
                    light: "#ff7961",
                    main: "#f44336",
                    dark: "#ba000d",
                    contrastText: "#fff",
                },
                background: {
                    default: "#fff",
                    paper: "#fbfbfb",
                },
                secondaryBackground: {
                    default: "#eee",
                    paper: "#ddd",
                },
            },
        },
        dark: {
            palette: {
                primary: {
                    light: "#6fbf73",
                    main: "#4caf50",
                    dark: "#357a38",
                    contrastText: "#fff",
                },
                secondary: {
                    light: "#ff7961",
                    main: "#f44336",
                    dark: "#ba000d",
                    contrastText: "#fff",
                },
                background: {
                    default: "#000",
                    paper: "#111",
                },
                secondaryBackground: {
                    default: "#212121",
                    paper: "#222",
                },
            },
        },
    },
});

export default theme;
