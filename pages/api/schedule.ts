import { sitToRezervoWeekSchedule } from "lib/integration/adapters";
import { fetchRezervoWeekSchedule } from "lib/integration/common";
import { fetchSitWeekSchedule } from "lib/integration/sit";
import { serializeWeekSchedule } from "lib/serializers";
import { NextApiRequest, NextApiResponse } from "next";

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
