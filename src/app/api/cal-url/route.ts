import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import { doOperation, get, operationFailed, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();
    const response = await doOperation(() => get(`${process.env["CONFIG_HOST"]}/cal-token`, accessToken));
    if (operationFailed(response)) return response as NextResponse;

    const calendarToken = await response.json();
    const calendarFeedUrl = new URL(`${process.env["CONFIG_HOST"]}/cal`);
    const includePastQuery = new URL(req.url ?? "").searchParams.get("include_past") ?? "";
    calendarFeedUrl.searchParams.set("include_past", includePastQuery === "true" ? "true" : "false");
    calendarFeedUrl.searchParams.set("token", calendarToken);

    return NextResponse.json(calendarFeedUrl, { status: response.status });
});
