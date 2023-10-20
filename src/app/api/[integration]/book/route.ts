import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    doOperation,
    integrationIdentifierFromContext,
    post,
    respondNotFound,
    respondUnauthorized,
    tryUseRefreshToken,
} from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const integrationIdentifier = integrationIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (integrationIdentifier === null) return respondNotFound();

    const data = await req.text();
    return await doOperation(() =>
        post(`${process.env["CONFIG_HOST"]}/${integrationIdentifier}/book`, accessToken, data),
    );
});
