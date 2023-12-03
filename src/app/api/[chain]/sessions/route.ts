import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    get,
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

    return await doOperation(() => get(`${process.env["CONFIG_HOST"]}/${chainIdentifier}/sessions`, accessToken));
});
