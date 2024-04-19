import {
    createAuthenticatedEndpoint,
    doOperation,
    get,
    respondNotFound,
    thumbnailSizeFromContext,
    userIdFromContext,
} from "@/lib/helpers/api";

export const GET = createAuthenticatedEndpoint(async (req, ctx, accessToken) => {
    const userId = userIdFromContext(ctx);
    if (userId === null) return respondNotFound();

    const thumbnailSize = thumbnailSizeFromContext(ctx);
    if (thumbnailSize === null) return respondNotFound();

    // TODO: cleaner implementation
    req.nextUrl.searchParams.get("CACHE-BUSTER-NOT-ACTUALLY-USED");

    return await doOperation(() => get(`user/${userId}/avatar/${thumbnailSize}`, accessToken));
});
