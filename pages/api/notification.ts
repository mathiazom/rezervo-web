import { NextApiRequest, NextApiResponse } from "next";
import * as webPush from "web-push";

webPush.setVapidDetails(
    `mailto:${process.env["WEB_PUSH_EMAIL"]}`,
    process.env["NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY"] ?? "",
    process.env["WEB_PUSH_PRIVATE_KEY"] ?? "",
);

// TODO: this logic should be moved to the rezervo backend, so that we can trigger notifications
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
    }
    const { subscription, message } = req.body;

    if (!subscription || !message) {
        return res.status(400).send("Subscription details and message are required.");
    }

    try {
        const response = await webPush.sendNotification(subscription, JSON.stringify({ title: "rezervo", message }));
        res.status(response.statusCode).send(response.body);
    } catch (error: any) {
        if ("statusCode" in error) {
            res.status(error.statusCode).send(error.body);
        } else {
            console.error(error);
            res.status(500).end();
        }
    }
}
