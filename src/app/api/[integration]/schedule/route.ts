import { constants } from "http2";

import { AppRouteHandlerFnContext } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

import { integrationIdentifierFromContext, respondNotFound } from "@/lib/helpers/api";
import { fetchRezervoWeekSchedule } from "@/lib/helpers/fetchers";
import activeIntegrations from "@/lib/providers/active";
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
    const businessUnit = integration.businessUnits[0];
    if (!businessUnit) {
        throw new Error(`${integration.profile.name} does not have any business units`);
    }

    return NextResponse.json(
        serializeWeekSchedule(
            await fetchRezervoWeekSchedule(
                weekOffset,
                businessUnit.weekScheduleFetcher,
                businessUnit.weekScheduleAdapter,
            ),
        ),
    );
};
