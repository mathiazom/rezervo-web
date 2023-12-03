import { constants } from "http2";

import { AppRouteHandlerFnContext } from "@auth0/nextjs-auth0";

import activeChains from "@/lib/activeChains";
import { chainIdentifierFromContext, respondNotFound } from "@/lib/helpers/api";
import { fetchRezervoWeekSchedule } from "@/lib/helpers/fetchers";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";
import { RezervoChain } from "@/types/chain";

export const POST = async (req: Request, ctx: AppRouteHandlerFnContext) => {
    const weekOffset = (await req.json())["weekOffset"];
    if (weekOffset === undefined) {
        return Response.json(
            { message: "weekOffset is a required parameter" },
            { status: constants.HTTP_STATUS_BAD_REQUEST },
        );
    }

    const chainIdentifier = chainIdentifierFromContext(ctx);
    if (chainIdentifier === null) return respondNotFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: RezervoChain<any> = activeChains[chainIdentifier];

    return Response.json(
        serializeWeekSchedule(
            await fetchRezervoWeekSchedule(
                weekOffset,
                chain.provider.weekScheduleFetcher,
                chain.provider.weekScheduleAdapter,
            ),
        ),
    );
};
