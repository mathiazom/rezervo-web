import { unstable_noStore as noStore } from "next/cache";

function requireEnv(env: string): string {
    noStore();
    const value = global.process.env[env];
    if (!value) {
        throw new Error(`Missing environment variable: ${env}`);
    }
    return value;
}

export const GET = async () => {
    const baseUrl = requireEnv("FUSIONAUTH_URL");
    const signOutUrl = new URL("/oauth2/logout", baseUrl);
    const clientId = requireEnv("FUSIONAUTH_CLIENT_ID");
    signOutUrl.searchParams.append("client_id", clientId);
    return Response.json(signOutUrl.toString());
};
