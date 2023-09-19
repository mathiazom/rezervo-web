import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

import { respondUnauthorized, tryUseRefreshToken } from "@/lib/helpers/api";

export const GET = withApiAuthRequired(async (req) => {
    const accessToken = await tryUseRefreshToken(req);
    if (!accessToken) return respondUnauthorized();

    return NextResponse.json(process.env["WEB_PUSH_PUBLIC_KEY"]);
});
