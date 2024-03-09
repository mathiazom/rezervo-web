import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { doOperation, post, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    return await doOperation(() => post(`notifications/push/verify`, accessToken, data));
});
