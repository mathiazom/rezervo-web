import NextAuth from "next-auth";
import FusionAuthProvider from "next-auth/providers/fusionauth";

function requireEnv(env: string): string {
    const value = process.env[env];
    if (!value) {
        throw new Error(`Missing environment variable: ${env}`);
    }
    return value;
}

const fusionAuthIssuer = requireEnv("FUSIONAUTH_ISSUER");
const fusionAuthClientId = requireEnv("FUSIONAUTH_CLIENT_ID");
const fusionAuthClientSecret = requireEnv("FUSIONAUTH_CLIENT_SECRET");
const fusionAuthUrl = requireEnv("FUSIONAUTH_URL");
const fusionAuthTenantId = requireEnv("FUSIONAUTH_TENANT_ID");

const authOptions = {
    providers: [
        FusionAuthProvider({
            issuer: fusionAuthIssuer,
            clientId: fusionAuthClientId,
            clientSecret: fusionAuthClientSecret,
            wellKnown: `${fusionAuthUrl}/.well-known/openid-configuration/${fusionAuthTenantId}`,
            tenantId: fusionAuthTenantId,
            authorization: {
                params: {
                    scope: "openid offline_access email profile",
                },
            },
        }),
    ],
    // TODO: clean this up
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({ token, account }: { token: any; account: any }) {
            if (account) {
                // Save the access token and refresh token in the JWT on the initial login, as well as the user details
                return {
                    ...token,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    user: account.user,
                };
            } else if (Date.now() < token.expires_at * 1000) {
                // If the access token has not expired yet, return it
                return token;
            } else {
                if (!token.refresh_token) throw new Error("Missing refresh token");
                // If the access token has expired, try to refresh it
                try {
                    const response = await fetch(`${fusionAuthUrl}/api/jwt/refresh`, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            refreshToken: token.refresh_token,
                            token: token.access_token,
                        }),
                        method: "POST",
                    });
                    const tokens = await response.json();
                    if (!response.ok) throw tokens;
                    return {
                        ...token, // Keep the previous token properties
                        access_token: tokens.token,
                        expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
                        // Fall back to old refresh token, but note that
                        // many providers may only allow using a refresh token once.
                        refresh_token: tokens.refreshToken ?? token.refresh_token,
                    };
                } catch (error) {
                    console.error("Error refreshing access token", JSON.stringify(error, null, 2));
                    // The error property will be used client-side to handle the refresh token error
                    return { ...token, error: "RefreshAccessTokenError" as const };
                }
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ token, session }: { token: any; session: any }) {
            return session ? Object.assign({}, session, { accessToken: token.access_token }) : session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
