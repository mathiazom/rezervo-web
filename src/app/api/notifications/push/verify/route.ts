import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { doOperation, post, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const POST = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    return await doOperation(() =>
        post(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/notifications/push/verify`, accessToken, data),
    );
});
