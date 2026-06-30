import { connection } from "next/server";

export async function requireServerEnv(env: string): Promise<string> {
    await connection();
    const value = global.process.env[env];
    if (!value) {
        throw new Error(`Missing environment variable: ${env}`);
    }
    return value;
}

export async function requireServerAuthConfig() {
    return {
        clientId: await requireServerEnv("FUSIONAUTH_CLIENT_ID"),
        authorizationEndpoint: `${await requireServerEnv("FUSIONAUTH_URL")}/oauth2/authorize`,
        logoutEndpoint: `${await requireServerEnv("FUSIONAUTH_URL")}/oauth2/logout`,
        logoutRedirect: await requireServerEnv("HOST"),
        redirectUri: await requireServerEnv("HOST"),
        // TODO: retrieve from FusionAuth
        refreshTokenExpiresIn: Number(await requireServerEnv("FUSIONAUTH_REFRESH_TOKEN_EXPIRES_IN_SECONDS")),
    };
}
