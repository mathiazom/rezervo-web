import { NextApiRequest, NextApiResponse } from "next";
import * as webPush from "web-push";
import { WebPushError } from "web-push";

webPush.setVapidDetails(
    `mailto:${process.env["WEB_PUSH_EMAIL"]}`,
    process.env["NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY"] ?? "",
    process.env["WEB_PUSH_PRIVATE_KEY"] ?? "",
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();
    }
    const { subscription, message, webPushPrivateKey } = req.body;

    if (!subscription || !message) {
        return res.status(400).send("Subscription details and message are required.");
    }

    if (webPushPrivateKey !== process.env["WEB_PUSH_PRIVATE_KEY"]) {
        return res.status(403).send("Incorrect WebPush private key");
    }

    try {
        const response = await webPush.sendNotification(subscription, JSON.stringify({ title: "rezervo", message }));
        res.status(response.statusCode).send(response.body);
    } catch (error) {
        if (error instanceof WebPushError) {
            res.status(error.statusCode).send(error.body);
        } else {
            console.error(error);
            res.status(500).end();
        }
    }
}
