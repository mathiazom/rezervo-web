"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { TAuthConfig, TRefreshTokenExpiredEvent } from "react-oauth2-code-pkce";
import useSWR from "swr";

import { popStoredPreLoginPath, storePreLoginPath } from "@/lib/helpers/storage";

const DynamicAuthProvider = dynamic(() => import("react-oauth2-code-pkce").then((mod) => mod.AuthProvider), {
    ssr: false,
});

export type BaseAuthConfig = Pick<
    TAuthConfig,
    "clientId" | "authorizationEndpoint" | "logoutEndpoint" | "logoutRedirect" | "redirectUri"
>;

export default function AuthProvider({ children }: { children: ReactNode }) {
    const { data: authConfig } = useSWR<BaseAuthConfig>("api/auth/config", async (path: string) =>
        (await fetch(path)).json(),
    );

    if (!authConfig) {
        return <>{children}</>;
    }

    return (
        <DynamicAuthProvider
            authConfig={{
                ...authConfig,
                autoLogin: false,
                clearURL: false,
                tokenEndpoint: "/api/auth/token",
                scope: "openid offline_access email profile",
                onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => event.logIn(undefined, undefined, "popup"), // TODO
                // redirect back to original path after login has completed
                preLogin: () => storePreLoginPath(window.location.href),
                postLogin: () => window.location.replace(popStoredPreLoginPath() || ""),
            }}
        >
            {children}
        </DynamicAuthProvider>
    );
}
