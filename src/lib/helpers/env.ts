export function requireServerAuthConfig() {
    return {
        clientId: global.process.env["FUSIONAUTH_CLIENT_ID"] ?? "",
        authorizationEndpoint: `${global.process.env["FUSIONAUTH_URL"]}/oauth2/authorize`,
        logoutEndpoint: `${global.process.env["FUSIONAUTH_URL"]}/oauth2/logout`,
        logoutRedirect: global.process.env["HOST"] ?? "",
        redirectUri: global.process.env["HOST"] ?? "",
        // TODO: retrieve from FusionAuth
        refreshTokenExpiresIn: Number(global.process.env["FUSIONAUTH_REFRESH_TOKEN_EXPIRES_IN_SECONDS"]),
    };
}
