"use client";

import { createTheme } from "@mui/material";
import type { Theme, TypeBackground } from "@mui/material/styles";

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

/**
 * Scheme-aware theme accessor. With `cssVariables: true`, `theme.palette.*` is static and
 * does not react to color-scheme changes, so colors must be read from `theme.vars` (which emits
 * `var(--mui-palette-*)`). `theme.vars` is typed optional, hence the `?? theme` fallback.
 */
export const vars = (theme: Theme) => theme.vars ?? theme;
