import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { constants } from "http2";

function get(accessToken: string): Promise<Response> {
    return fetch(`${process.env["CONFIG_HOST"]}/cal_token`, {
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
    const calendarToken = await response.json();
    const calendarFeedUrl = new URL(`${process.env["CONFIG_HOST"]}/cal`);
    let includePastQuery = req.query["include_past"];
    calendarFeedUrl.searchParams.set(
        "include_past",
        (typeof includePastQuery !== "string" ? includePastQuery?.pop() : includePastQuery) || "true",
    );
    calendarFeedUrl.searchParams.set("token", calendarToken);
    res.status(response.status).json(calendarFeedUrl);
});
