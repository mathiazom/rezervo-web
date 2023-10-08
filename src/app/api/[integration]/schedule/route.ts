import { constants } from "http2";

import { AppRouteHandlerFnContext } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

import activeIntegrations from "@/lib/activeIntegrations";
import { integrationIdentifierFromContext, respondNotFound } from "@/lib/helpers/api";
import { fetchRezervoWeekSchedule } from "@/lib/helpers/fetchers";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";
import { RezervoIntegration } from "@/types/integration";

export const POST = async (req: NextRequest, ctx: AppRouteHandlerFnContext) => {
    const weekOffset = (await req.json())["weekOffset"];
    if (weekOffset === undefined) {
        return NextResponse.json(
            { message: "weekOffset is a required parameter" },
            { status: constants.HTTP_STATUS_BAD_REQUEST },
        );
    }

    const integrationIdentifier = integrationIdentifierFromContext(ctx);
    if (integrationIdentifier === null) return respondNotFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integration: RezervoIntegration<any> = activeIntegrations[integrationIdentifier];

    return NextResponse.json(
        serializeWeekSchedule(
            await fetchRezervoWeekSchedule(
                weekOffset,
                integration.provider.weekScheduleFetcher,
                integration.provider.weekScheduleAdapter,
            ),
        ),
    );
};
