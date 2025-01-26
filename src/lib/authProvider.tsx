"use client";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { TAuthConfig } from "react-oauth2-code-pkce";

import { popStoredPreLoginPath, storePreLoginPath } from "@/lib/helpers/storage";

const DynamicAuthProvider = dynamic(() => import("react-oauth2-code-pkce").then((mod) => mod.AuthProvider), {
    ssr: false,
});

export type BaseAuthConfig = Pick<
    TAuthConfig,
    "clientId" | "authorizationEndpoint" | "logoutEndpoint" | "logoutRedirect" | "redirectUri" | "refreshTokenExpiresIn"
>;

export default function AuthProvider({ config, children }: { config: BaseAuthConfig; children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <DynamicAuthProvider
            authConfig={{
                ...config,
                autoLogin: false,
                clearURL: false,
                tokenEndpoint: "/api/auth/token",
                scope: "openid offline_access email profile",
                // redirect back to original path after login has completed
                preLogin: () => storePreLoginPath(pathname == null || pathname == "/login" ? "/" : pathname),
                postLogin: () => router.replace(popStoredPreLoginPath() || ""),
            }}
        >
            {children}
        </DynamicAuthProvider>
    );
}
