import { NextApiRequest, NextApiResponse } from "next";

import { fetchRezervoWeekSchedule } from "@/lib/helpers/fetchers";
import { sitToRezervoWeekSchedule } from "@/lib/integrations/sit/adapters";
import { fetchSitWeekSchedule } from "@/lib/integrations/sit/fetchers";
import { serializeWeekSchedule } from "@/lib/serialization/serializers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const weekOffset = JSON.parse(req.body)["weekOffset"];
    if (weekOffset === undefined) {
        return res.status(400).json({ message: "weekOffset is a required parameter" });
    }

    return res.json(
        serializeWeekSchedule(
            await fetchRezervoWeekSchedule(weekOffset, fetchSitWeekSchedule, sitToRezervoWeekSchedule),
        ),
    );
}
