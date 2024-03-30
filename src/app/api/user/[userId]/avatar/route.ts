import { AppRouteHandlerFnContext, withApiAuthRequired } from "@auth0/nextjs-auth0";

import {
    buildBackendPath,
    destroy,
    doOperation,
    isUserMeFromContext,
    respondNotFound,
    respondUnauthorized,
    tryUseRefreshToken,
} from "@/lib/helpers/api";

export const PUT = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    if (!isUserMeFromContext(ctx as AppRouteHandlerFnContext)) return respondNotFound();

    const formData = await req.formData();
    return await doOperation(() =>
        fetch(buildBackendPath("user/me/avatar"), {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        }),
    );
});

export const DELETE = withApiAuthRequired(async (req, ctx) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    if (!isUserMeFromContext(ctx as AppRouteHandlerFnContext)) return respondNotFound();

    return await doOperation(() => destroy("user/me/avatar", accessToken));
});
