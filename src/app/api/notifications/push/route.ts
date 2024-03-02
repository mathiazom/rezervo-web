import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { destroy, doOperation, put, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const PUT = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    return await doOperation(() =>
        put(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/notifications/push`, accessToken, data),
    );
});

export const DELETE = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    const data = await req.text();
    return await doOperation(() =>
        destroy(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/notifications/push`, accessToken, data),
    );
});
