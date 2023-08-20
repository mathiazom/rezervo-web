import { NextApiRequest, NextApiResponse } from "next";
import { fetchSitWeekSchedule } from "../../lib/integration/sit";
import { sitToRezervoWeekSchedule } from "../../lib/integration/adapters";
import { fetchRezervoWeekSchedule } from "../../lib/integration/common";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const weekOffset = JSON.parse(req.body)["weekOffset"];
    if (weekOffset === undefined) {
        return res.status(400).json({ message: "weekOffset is a required parameter" });
    }

    return res.json(await fetchRezervoWeekSchedule(weekOffset, fetchSitWeekSchedule, sitToRezervoWeekSchedule));
}
