import NextAuth, { Account, AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

import { CustomJWT, CustomSession, isCustomJWT } from "@/lib/helpers/auth/auth";
import { buildFusionAuthProvider, refreshTokenWithFusionAuth } from "@/lib/helpers/auth/fusionAuth";

function requireEnv(env: string): string {
    const value = process.env[env];
    if (!value) {
        throw new Error(`Missing environment variable: ${env}`);
    }
    return value;
}

const TOKEN_REFRESH_BUFFER_SECONDS = 60000;

const FUSIONAUTH_URL = requireEnv("FUSIONAUTH_URL");

const HOST = requireEnv("HOST");

const authOptions: AuthOptions = {
    theme: {
        logo: `${HOST}/android-chrome-512x512.png`,
        brandColor: "#F58320", // FusionAuth 'Carrot Orange'
    },
    providers: [
        buildFusionAuthProvider(
            requireEnv("FUSIONAUTH_ISSUER"),
            requireEnv("FUSIONAUTH_CLIENT_ID"),
            requireEnv("FUSIONAUTH_CLIENT_SECRET"),
            FUSIONAUTH_URL,
            `${HOST}/fusionauth_logo_white_orange.png`,
            requireEnv("FUSIONAUTH_TENANT_ID"),
        ),
    ],
    callbacks: {
        async jwt({ token, account }: { token: JWT; account: Account | null }) {
            if (account) {
                if (account.access_token && account.refresh_token && account.expires_at) {
                    const customJWT: CustomJWT = {
                        ...token,
                        accessToken: account.access_token,
                        refreshToken: account.refresh_token,
                        expiresAt: account.expires_at,
                        expiresAtISO: new Date(account.expires_at).toISOString(),
                    };
                    return customJWT;
                }
                return { ...token, error: "AccessTokenError" };
            }
            if (!isCustomJWT(token)) {
                console.error("Invalid token", JSON.stringify(token, null, 2));
                return { ...token, error: "RefreshAccessTokenError" };
            }
            if (Date.now() < token.expiresAt - TOKEN_REFRESH_BUFFER_SECONDS) {
                return token;
            }
            try {
                return refreshTokenWithFusionAuth(FUSIONAUTH_URL, token);
            } catch (error) {
                console.error("Error refreshing access token", JSON.stringify(error, null, 2));
                return { ...token, error: "RefreshAccessTokenError" };
            }
        },
        async session({ token, session }: { token: JWT; session: Session }) {
            if (!isCustomJWT(token)) {
                return session;
            }
            const customSession: CustomSession = {
                ...session,
                accessToken: token.accessToken,
                expiresAt: token.expiresAt,
                expires: token.expiresAtISO,
            };
            return customSession;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
