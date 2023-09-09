import { constants } from "http2";

import { NextApiRequest, NextApiResponse } from "next";

import { integrationIdentifierFromRequest } from "@/lib/helpers/api";
import { fetchRezervoWeekSchedule } from "@/lib/helpers/fetchers";
import activeIntegrations from "@/lib/integrations/active";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";
import { RezervoIntegration } from "@/types/integration";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const weekOffset = JSON.parse(req.body)["weekOffset"];
    if (weekOffset === undefined) {
        return res.status(400).json({ message: "weekOffset is a required parameter" });
    }
    const integrationIdentifier = integrationIdentifierFromRequest(req);
    if (integrationIdentifier == null) {
        res.status(constants.HTTP_STATUS_NOT_FOUND).send("Not found");
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const integration: RezervoIntegration<any> = activeIntegrations[integrationIdentifier];
    const businessUnit = integration.businessUnits[0];
    if (!businessUnit) {
        throw new Error(`${integration.profile.name} does not have any business units`);
    }

    return res.json(
        serializeWeekSchedule(
            await fetchRezervoWeekSchedule(
                weekOffset,
                businessUnit.weekScheduleFetcher,
                businessUnit.weekScheduleAdapter,
            ),
        ),
    );
}
