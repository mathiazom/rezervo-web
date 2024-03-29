import { constants } from "http2";

import { AppRouteHandlerFnContext } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";

import { chainIdentifierFromContext, respondNotFound } from "@/lib/helpers/api";
import { fetchRezervoWeekSchedule } from "@/lib/helpers/fetchers";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";

export const GET = async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
    const queryParams = req.nextUrl.searchParams;
    const weekOffsetString: string | null = queryParams.get("weekOffset");
    if (weekOffsetString === null) {
        return Response.json(
            { message: "weekOffset is a required parameter" },
            { status: constants.HTTP_STATUS_BAD_REQUEST },
        );
    }
    const weekOffset = Number(weekOffsetString);
    if (Number.isNaN(weekOffset)) {
        return Response.json({ message: "weekOffset must be a number" }, { status: constants.HTTP_STATUS_BAD_REQUEST });
    }
    const locationIds = queryParams.getAll("locationId");
    const chainIdentifier = chainIdentifierFromContext(ctx);
    if (chainIdentifier === null) return respondNotFound();
    return Response.json(
        serializeWeekSchedule(await fetchRezervoWeekSchedule(chainIdentifier, weekOffset, locationIds)),
    );
};
