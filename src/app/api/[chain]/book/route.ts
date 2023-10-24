import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    chainIdentifierFromContext,
    doOperation,
    post,
    respondNotFound,
    respondUnauthorized,
    tryUseRefreshToken,
} from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const chainIdentifier = chainIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (chainIdentifier === null) return respondNotFound();

    const data = await req.text();
    return await doOperation(() => post(`${process.env["CONFIG_HOST"]}/${chainIdentifier}/book`, accessToken, data));
});
