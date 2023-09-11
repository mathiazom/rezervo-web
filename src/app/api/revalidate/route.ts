import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import activeIntegrations from "@/lib/integrations/active";

export const GET = async (req: NextRequest) => {
    const secret = req.nextUrl.searchParams.get("secret");

    if (secret !== process.env["REVALIDATION_SECRET_TOKEN"]) {
        return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    await Promise.all(
        Object.keys(activeIntegrations).map((integration) => {
            console.log(`Revalidating /${integration}`);
            return revalidatePath(`/${integration}`);
        }),
    );

    return NextResponse.json({ revalidated: true, now: Date.now() });
};
