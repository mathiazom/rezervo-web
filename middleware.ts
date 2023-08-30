import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    url.pathname = "/sit";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: "/",
};
