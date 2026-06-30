import { unstable_noStore as noStore } from "next/cache";

export function requireServerEnv(env: string): string {
    noStore();
    const value = global.process.env[env];
    if (!value) {
        throw new Error(`Missing environment variable: ${env}`);
    }
    return value;
}

export function requireServerAuthConfig() {
    return {
        clientId: requireServerEnv("FUSIONAUTH_CLIENT_ID"),
        authorizationEndpoint: `${requireServerEnv("FUSIONAUTH_URL")}/oauth2/authorize`,
        logoutEndpoint: `${requireServerEnv("FUSIONAUTH_URL")}/oauth2/logout`,
        logoutRedirect: requireServerEnv("HOST"),
        redirectUri: requireServerEnv("HOST"),
        // TODO: retrieve from FusionAuth
        refreshTokenExpiresIn: Number(requireServerEnv("FUSIONAUTH_REFRESH_TOKEN_EXPIRES_IN_SECONDS")),
    };
}
