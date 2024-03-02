import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { doOperation, get, put, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    return await doOperation(() => get(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/preferences`, accessToken));
});

export const PUT = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();
    const data = await req.text();
    return await doOperation(() => put(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/preferences`, accessToken, data));
});
