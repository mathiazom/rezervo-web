import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import { destroy, doOperation, operationFailed, put, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const PUT = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    const response = await doOperation(() =>
        put(`${process.env["CONFIG_HOST"]}/notifications/push`, accessToken, data),
    );
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});

export const DELETE = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    const response = await doOperation(() =>
        destroy(`${process.env["CONFIG_HOST"]}/notifications/push`, accessToken, data),
    );
    if (operationFailed(response)) return response as NextResponse;

    // Should return `204 No Content`, but `NextResponse` does not support it, and `withApiAuthRequired` requires `NextResponse`
    return NextResponse.json(null, { status: response.status == 204 ? 200 : response.status });
});
