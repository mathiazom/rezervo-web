import { constants } from "http2";

import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function put(accessToken: string, body: any): Promise<Response> {
    return fetch(`${process.env["CONFIG_HOST"]}/preferences`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: body,
    });
}

function get(accessToken: string): Promise<Response> {
    return fetch(`${process.env["CONFIG_HOST"]}/preferences`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
}

export default withApiAuthRequired(async function handler(req, res) {
    // If your access token is expired and you have a refresh token
    // `getAccessToken` will fetch you a new one using the `refresh_token` grant
    const { accessToken } = await getAccessToken(req, res);
    if (accessToken == null) {
        res.status(constants.HTTP_STATUS_UNAUTHORIZED).send("Not authenticated");
        return;
    }
    const response = await (() => {
        switch (req.method) {
            case "PUT":
                return put(accessToken, req.body);
            case "GET":
                return get(accessToken);
            default:
                return null;
        }
    })();
    if (response == null) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("Request failed");
        return;
    }
    if (!response.ok) {
        console.error(response);
        res.status(response.status).json(response.statusText);
        return;
    }
    res.status(response.status).json(await response.json());
});
