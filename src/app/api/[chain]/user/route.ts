import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    get,
    put,
    tryUseRefreshToken,
    respondUnauthorized,
    respondNotFound,
    doOperation,
    chainIdentifierFromContext,
} from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const chainIdentifier = chainIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (chainIdentifier === null) return respondNotFound();

    return await doOperation(() =>
        get(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${chainIdentifier}/user`, accessToken),
    );
});

export const PUT = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const chainIdentifier = chainIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (chainIdentifier === null) return respondNotFound();

    const data = await req.text();
    return await doOperation(() =>
        put(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${chainIdentifier}/user`, accessToken, data),
    );
});
