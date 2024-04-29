import { FusionAuthProviderConfig } from "@fusionauth/react-sdk";

function requireEnv(name: string, value: string | undefined): string {
    if (!value) {
        throw new Error(name + " environment variable is missing.");
    }
    return value;
}

export const fusionAuthConfig: FusionAuthProviderConfig = {
    clientId: requireEnv("NEXT_PUBLIC_FUSIONAUTH_CLIENT_ID", process.env["NEXT_PUBLIC_FUSIONAUTH_CLIENT_ID"]),
    redirectUri: requireEnv(
        "NEXT_PUBLIC_FUSIONAUTH_REDIRECT_URI",
        process.env["NEXT_PUBLIC_FUSIONAUTH_REDIRECT_URI"],
    ),
    serverUrl: requireEnv("NEXT_PUBLIC_FUSIONAUTH_URL", process.env["NEXT_PUBLIC_FUSIONAUTH_URL"]),
    scope: "openid offline_access email profile",
    shouldAutoFetchUserInfo: true,
    shouldAutoRefresh: true,
};
