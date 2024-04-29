import { jwtDecode } from "jwt-decode";
import FusionAuthProvider from "next-auth/providers/fusionauth";

import { CustomJWT } from "@/lib/helpers/auth/auth";

export function buildFusionAuthSignOutUrl() {
    const baseUrl = process.env["NEXT_PUBLIC_FUSIONAUTH_URL"];
    if (baseUrl == null) {
        throw new Error("FUSIONAUTH_URL not set");
    }
    const signOutUrl = new URL("/oauth2/logout", baseUrl);
    const clientId = process.env["NEXT_PUBLIC_FUSIONAUTH_CLIENT_ID"];
    if (clientId == null) {
        throw new Error("FUSIONAUTH_CLIENT_ID not set");
    }
    signOutUrl.searchParams.append("client_id", clientId);
    return signOutUrl.toString();
}

export function buildFusionAuthProvider(
    issuer: string,
    clientId: string,
    clientSecret: string,
    url: string,
    logoUrl: string,
    tenantId: string,
) {
    return FusionAuthProvider({
        issuer,
        clientId,
        clientSecret,
        tenantId,
        wellKnown: `${url}/.well-known/openid-configuration/${tenantId}`,
        authorization: {
            params: {
                scope: "openid offline_access email profile",
            },
        },
        style: {
            // TODO: bgDark does not seem to work, try again later...
            logo: logoUrl,
            bg: "#1E293B",
            text: "#ffffff",
        },
    });
}

export async function refreshTokenWithFusionAuth(url: string, token: CustomJWT): Promise<CustomJWT> {
    const refreshResponse = await fetch(`${url}/api/jwt/refresh`, {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refreshToken: token.refreshToken,
            token: token.accessToken,
        }),
        method: "POST",
    });
    const refreshData = await refreshResponse.json();
    if (!refreshResponse.ok) {
        const responseText = await refreshResponse.text();
        throw new Error(
            `Request to refresh access token rejected with status ${refreshResponse.status} and message ${responseText}`,
        );
    }
    // console.log(Date.now(), "tokens", JSON.stringify(tokens, null, 2));
    const freshAccessToken = refreshData.token;
    const decodedFreshAccessToken = jwtDecode(freshAccessToken);
    // console.log(Date.now(), "decodedToken", JSON.stringify(decodedFreshAccessToken, null, 2));
    if (!decodedFreshAccessToken.exp) throw new Error("Missing token expiration in token refresh response");
    const expiresAt = decodedFreshAccessToken.exp * 1000;
    return {
        ...token,
        accessToken: freshAccessToken,
        expiresAt: expiresAt,
        expiresAtISO: new Date(expiresAt).toISOString(),
        // Fall back to old refresh token, but note that reuse might be blocked
        refreshToken: refreshData.refreshToken ?? token.refreshToken,
    };
}
