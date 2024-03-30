import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    buildBackendPath,
    doOperation,
    respondNotFound,
    respondUnauthorized,
    thumbnailSizeFromContext,
    tryUseRefreshToken,
    userIdFromContext,
} from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const userId = userIdFromContext(ctx as AppRouteHandlerFnContext);
    if (userId === null) return respondNotFound();

    const thumbnailSize = thumbnailSizeFromContext(ctx as AppRouteHandlerFnContext);
    if (thumbnailSize === null) return respondNotFound();

    // TODO: cleaner implementation
    req.nextUrl.searchParams.get("CACHE-BUSTER-NOT-ACTUALLY-USED");

    return await doOperation(() =>
        fetch(buildBackendPath(`user/${userId}/avatar/${thumbnailSize}`), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }),
    );
});
