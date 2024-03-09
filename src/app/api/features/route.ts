import { withApiAuthRequired } from "@auth0/nextjs-auth0";

import { doOperation, get, respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    return await doOperation(() => get(`features`, accessToken));
});
