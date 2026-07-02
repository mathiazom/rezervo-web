/// <reference types="vite/client" />
import "@/styles/globals.css";
import "@/styles/animations.css";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import fontsourceVariableRobotoCss from "@fontsource-variable/roboto?url";

import AuthProvider from "@/lib/authProvider";
import SnowfallProvider from "@/lib/snowfallProvider";
import theme from "@/lib/theme";
import SerwistRegister from "@/components/utils/SerwistRegister";
import NotFound from "@/components/utils/NotFound";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { createServerFn } from "@tanstack/react-start";
import { requireServerEnv } from "@/lib/helpers/env";

const getAuthConfig = createServerFn({ method: "GET" }).handler(() => ({
    clientId: requireServerEnv("FUSIONAUTH_CLIENT_ID"),
    authorizationEndpoint: `${requireServerEnv("FUSIONAUTH_URL")}/oauth2/authorize`,
    logoutEndpoint: `${requireServerEnv("FUSIONAUTH_URL")}/oauth2/logout`,
    logoutRedirect: requireServerEnv("APP_HOST"),
    redirectUri: requireServerEnv("APP_HOST"),
    // TODO: retrieve from FusionAuth
    refreshTokenExpiresIn: Number(requireServerEnv("FUSIONAUTH_REFRESH_TOKEN_EXPIRES_IN_SECONDS")),
}));

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { name: "theme-color", content: "black" },
            { title: "rezervo" },
            { name: "description", content: "Automatisk booking av gruppetimer" },
            { name: "application-name", content: "rezervo" },
            { property: "og:type", content: "website" },
            { property: "og:title", content: "rezervo" },
            { property: "og:description", content: "Automatisk booking av gruppetimer" },
            { property: "og:site_name", content: "rezervo" },
            { property: "og:url", content: "https://rezervo.no" },
            { property: "og:image", content: "https://rezervo.no/apple-touch-icon.png" },
            { name: "format-detection", content: "telephone=no" },
            { name: "apple-mobile-web-app-title", content: "rezervo" },
            { name: "apple-mobile-web-app-capable", content: "yes" },
            { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        ],
        links: [
            { rel: "manifest", href: "/manifest.json" },
            { rel: "icon", href: "/icon.png" },
            { rel: "icon", sizes: "16x16", href: "/favicon-16x16.png" },
            { rel: "icon", sizes: "32x32", href: "/favicon-32x32.png" },
            { rel: "shortcut icon", href: "/favicon.ico" },
            { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
            { rel: "stylesheet", href: fontsourceVariableRobotoCss },
        ],
    }),
    loader: () => getAuthConfig(),
    component: RootComponent,
    notFoundComponent: () => <NotFound />,
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function Providers({ children }: { children: ReactNode }) {
    const emotionCache = createCache({ key: "css" });
    const authConfig = Route.useLoaderData();
    return (
        <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
                <AuthProvider config={authConfig}>
                    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="nb-NO">
                        <CssBaseline enableColorScheme />
                        <SnowfallProvider />
                        <SerwistRegister />
                        {children}
                        <ReactQueryDevtools initialIsOpen={false} />
                    </LocalizationProvider>
                </AuthProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

function RootDocument({ children }: { children: ReactNode }) {
    return (
        <html lang="no">
            <head>
                <HeadContent />
            </head>
            <body>
                <Providers>{children}</Providers>
                <TanStackRouterDevtools position="bottom-right" />
                <Scripts />
            </body>
        </html>
    );
}
