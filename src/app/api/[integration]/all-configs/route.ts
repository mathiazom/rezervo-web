import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    get,
    tryUseRefreshToken,
    respondUnauthorized,
    respondNotFound,
    doOperation,
    integrationIdentifierFromContext,
} from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const integrationIdentifier = integrationIdentifierFromContext(ctx as AppRouteHandlerFnContext);
    if (integrationIdentifier === null) return respondNotFound();

    return await doOperation(() =>
        get(`${process.env["CONFIG_HOST"]}/${integrationIdentifier}/all-configs`, accessToken),
    );
});
