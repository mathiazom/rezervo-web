export const GET = async () => {
    const baseUrl = process.env["FUSIONAUTH_URL"];
    if (baseUrl == null) {
        throw new Error("FUSIONAUTH_URL not set");
    }
    const signOutUrl = new URL("/oauth2/logout", baseUrl);
    const clientId = process.env["FUSIONAUTH_CLIENT_ID"];
    if (clientId == null) {
        throw new Error("FUSIONAUTH_CLIENT_ID not set");
    }
    signOutUrl.searchParams.append("client_id", clientId);
    return Response.json(signOutUrl.toString());
};
