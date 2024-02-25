import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { doOperation, put, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const PUT = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    return await doOperation(() => put(`${process.env["CONFIG_HOST"]}/user`, accessToken));
});
