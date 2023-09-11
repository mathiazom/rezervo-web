import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import { doOperation, operationFailed, post, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    const response = await doOperation(() =>
        post(`${process.env["CONFIG_HOST"]}/notifications/push/verify`, accessToken, data),
    );
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});
