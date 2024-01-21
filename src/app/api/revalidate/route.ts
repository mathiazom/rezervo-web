import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

import { getChainIdentifiers } from "@/lib/activeChains";

export const GET = async (req: NextRequest) => {
    const secret = req.nextUrl.searchParams.get("secret");

    if (secret !== process.env["REVALIDATION_SECRET_TOKEN"]) {
        return Response.json({ message: "Invalid secret" }, { status: 401 });
    }

    await Promise.all(
        (await getChainIdentifiers()).map((chain) => {
            console.log(`Revalidating /${chain}`);
            return revalidatePath(`/${chain}`);
        }),
    );

    return Response.json({ revalidated: true, now: Date.now() });
};
