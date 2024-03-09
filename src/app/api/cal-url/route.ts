import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { doOperation, get, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();
    const response = await doOperation(() => get(`cal-token`, accessToken));
    if (!response.ok) return response;

    const calendarToken = await response.json();
    const calendarFeedUrl = new URL(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/cal`);
    const includePastQuery = new URL(req.url ?? "").searchParams.get("include_past") ?? "";
    calendarFeedUrl.searchParams.set("include_past", includePastQuery === "true" ? "true" : "false");
    calendarFeedUrl.searchParams.set("token", calendarToken);

    return Response.json(calendarFeedUrl, { status: response.status });
});
