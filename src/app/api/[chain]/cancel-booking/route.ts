import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    post,
    tryUseRefreshToken,
    respondUnauthorized,
    respondNotFound,
    doOperation,
    chainIdentifierFromContext,
} from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const chainIdentifier = chainIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (chainIdentifier === null) return respondNotFound();

    const data = await req.text();
    return await doOperation(() =>
        post(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${chainIdentifier}/cancel-booking`, accessToken, data),
    );
});
