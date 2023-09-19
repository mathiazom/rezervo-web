import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import { doOperation, get, operationFailed, put, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const response = await doOperation(() => get(`${process.env["CONFIG_HOST"]}/preferences`, accessToken));
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});

export const PUT = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();
    const data = await req.text();
    const response = await doOperation(() => put(`${process.env["CONFIG_HOST"]}/preferences`, accessToken, data));
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});
