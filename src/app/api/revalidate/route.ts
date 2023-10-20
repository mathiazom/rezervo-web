import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

import activeIntegrations from "@/lib/activeIntegrations";

export const GET = async (req: NextRequest) => {
    const secret = req.nextUrl.searchParams.get("secret");

    if (secret !== process.env["REVALIDATION_SECRET_TOKEN"]) {
        return Response.json({ message: "Invalid secret" }, { status: 401 });
    }

    await Promise.all(
        Object.keys(activeIntegrations).map((integration) => {
            console.log(`Revalidating /${integration}`);
            return revalidatePath(`/${integration}`);
        }),
    );

    return Response.json({ revalidated: true, now: Date.now() });
};
