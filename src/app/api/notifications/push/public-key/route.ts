import { createAuthenticatedEndpoint } from "@/lib/helpers/api";

export const GET = createAuthenticatedEndpoint(async () => {
    return Response.json(process.env["WEB_PUSH_PUBLIC_KEY"]);
});
