import { useLocation, useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useState, type ReactNode } from "react";
import {
    AuthContext,
    AuthProvider as OAuthProvider,
    type IAuthContext,
    type TAuthConfig,
} from "react-oauth2-code-pkce";

import { setApiAuthToken } from "@/lib/api/client";
import { popStoredPreLoginPath, storePreLoginPath } from "@/lib/helpers/storage";

function ApiAuthTokenSync() {
    const { token } = useContext<IAuthContext>(AuthContext);
    setApiAuthToken(token || null);
    return null;
}

export type BaseAuthConfig = Pick<
    TAuthConfig,
    "clientId" | "authorizationEndpoint" | "logoutEndpoint" | "logoutRedirect" | "redirectUri" | "refreshTokenExpiresIn"
>;

export default function AuthProvider({ config, children }: { config: BaseAuthConfig; children: ReactNode }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // react-oauth2-code-pkce must not run during SSR.
    if (!mounted) return <>{children}</>;

    return (
        <OAuthProvider
            authConfig={{
                ...config,
                autoLogin: false,
                clearURL: false,
                tokenEndpoint: "/api/auth/token",
                scope: "openid offline_access email profile",
                // redirect back to original path after login has completed
                preLogin: () => storePreLoginPath(pathname == null || pathname === "/login" ? "/" : pathname),
                postLogin: () => void navigate({ href: popStoredPreLoginPath() || "/" }),
            }}
        >
            <ApiAuthTokenSync />
            {children}
        </OAuthProvider>
    );
}
