import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import {
    post,
    tryUseRefreshToken,
    respondUnauthorized,
    integrationIdentifierFromContext,
    respondNotFound,
    doOperation,
    operationFailed,
} from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const integrationIdentifier = integrationIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (integrationIdentifier === null) return respondNotFound();

    const data = await req.text();
    const response = await doOperation(() =>
        post(`${process.env["CONFIG_HOST"]}/${integrationIdentifier}/cancel-booking`, accessToken, data),
    );
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});
