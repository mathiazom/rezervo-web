import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import {
    get,
    respondUnauthorized,
    tryUseRefreshToken,
    integrationIdentifierFromContext,
    respondNotFound,
    doOperation,
    operationFailed,
} from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const integrationIdentifier = integrationIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (integrationIdentifier === null) return respondNotFound();

    const response = await doOperation(() =>
        get(`${process.env["CONFIG_HOST"]}/${integrationIdentifier}/sessions`, accessToken),
    );
    if (operationFailed(response)) return response as NextResponse;

    return NextResponse.json(await response.json(), { status: response.status });
});