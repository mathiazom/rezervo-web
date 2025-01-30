import "@/styles/globals.css";
import "@/styles/animations.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import AuthProvider from "@/lib/authProvider";
import DatePickerLocalizationProvider from "@/lib/datePickerLocalizationProvider";
import { requireServerAuthConfig } from "@/lib/helpers/env";
import SnowfallProvider from "@/lib/snowfallProvider";
import theme from "@/lib/theme";

export const metadata: Metadata = {
    title: "rezervo",
    description: "Automatisk booking av gruppetimer",
    applicationName: "rezervo",
    openGraph: {
        type: "website",
        title: "rezervo",
        description: "Automatisk booking av gruppetimer",
        siteName: "rezervo",
        url: "https://rezervo.no",
        images: "https://rezervo.no/apple-touch-icon.png",
    },
    icons: {
        icon: [
            "/icon.png",
            {
                sizes: "16x16",
                url: "/favicon-16x16.png",
            },
            {
                sizes: "32x32",
                url: "/favicon-32x32.png",
            },
        ],
        shortcut: "/favicon.ico",
        apple: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            url: "/apple-touch-icon.png",
        },
    },
    formatDetection: {
        telephone: false,
    },
    appleWebApp: {
        title: "rezervo",
        statusBarStyle: "default",
        capable: true,
    },
};

export const viewport: Viewport = {
    themeColor: "black",
};

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-roboto",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const authConfig = requireServerAuthConfig();

    return (
        <html lang="no" className={roboto.className}>
            <ThemeProvider theme={theme} defaultMode={"system"} disableTransitionOnChange>
                <CssBaseline enableColorScheme />
                <AuthProvider config={authConfig}>
                    <DatePickerLocalizationProvider>
                        <SnowfallProvider />
                        <NuqsAdapter>
                            <body className={roboto.variable}>
                                <div id="root">
                                    <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
                                </div>
                            </body>
                        </NuqsAdapter>
                    </DatePickerLocalizationProvider>
                </AuthProvider>
            </ThemeProvider>
        </html>
    );
}
