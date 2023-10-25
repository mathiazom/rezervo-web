import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import { doOperation, get, operationFailed, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const response = await doOperation(() => get(`${process.env["CONFIG_HOST"]}/features`, accessToken));
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});
