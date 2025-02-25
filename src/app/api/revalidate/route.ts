import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const secret = process.env["REVALIDATION_SECRET_TOKEN"];

        if (secret == null || secret.trim().length == 0 || secret !== request.headers.get("x-revalidate-token")) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        // Revalidate the entire cache
        revalidatePath("/", "layout");

        return NextResponse.json({ revalidated: true, timestamp: Date.now() }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Error revalidating" }, { status: 500 });
    }
}
