import { constants } from "http2";

import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

export default withApiAuthRequired(async function handler(req, res) {
    // If your access token is expired and you have a refresh token
    // `getAccessToken` will fetch you a new one using the `refresh_token` grant
    const { accessToken } = await getAccessToken(req, res);
    if (accessToken == null) {
        res.status(constants.HTTP_STATUS_UNAUTHORIZED).send("Not authenticated");
        return;
    }
    switch (req.method) {
        case "GET":
            res.status(constants.HTTP_STATUS_OK).json(process.env["WEB_PUSH_PUBLIC_KEY"]);
            return;
        default:
            res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).send("Method not allowed");
            return;
    }
});
