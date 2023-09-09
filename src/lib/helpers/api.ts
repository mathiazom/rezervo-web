import { NextApiRequest } from "next";

import { IntegrationIdentifier } from "@/lib/integrations/active";

export function integrationIdentifierFromRequest(req: NextApiRequest): IntegrationIdentifier | null {
    const integrationArg = req.query["integration"];
    const integrationIdentifier = typeof integrationArg !== "string" ? integrationArg?.pop() : integrationArg;
    if (integrationIdentifier == undefined || !(integrationIdentifier in IntegrationIdentifier)) {
        return null;
    }
    return IntegrationIdentifier[integrationIdentifier as keyof typeof IntegrationIdentifier];
}
