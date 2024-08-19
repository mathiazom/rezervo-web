import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

import { requireServerEnv } from "@/lib/helpers/env";
import { fetchActiveChains } from "@/lib/helpers/fetchers";

export const GET = async (req: NextRequest) => {
    const secret = req.nextUrl.searchParams.get("secret");

    if (secret !== requireServerEnv("REVALIDATION_SECRET_TOKEN")) {
        return Response.json({ message: "Invalid secret" }, { status: 401 });
    }

    await Promise.all(
        (await fetchActiveChains()).map((chain) => {
            console.log(`Revalidating /${chain.profile.identifier}`);
            return revalidatePath(`/${chain.profile.identifier}`);
        }),
    );

    return Response.json({ revalidated: true, now: Date.now() });
};
