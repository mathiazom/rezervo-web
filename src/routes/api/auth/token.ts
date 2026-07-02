import { createFileRoute } from "@tanstack/react-router";

import { requireServerEnv } from "@/lib/helpers/env";

// Proxies the FusionAuth token exchange so `FUSIONAUTH_CLIENT_SECRET` stays server-side.
// `authProvider.tsx` posts to `tokenEndpoint: "/api/auth/token"` — this path must not change.
export const Route = createFileRoute("/api/auth/token")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const data = await request.formData();
                data.set("client_secret", requireServerEnv("FUSIONAUTH_CLIENT_SECRET"));
                const res = await fetch(`${requireServerEnv("FUSIONAUTH_URL")}/oauth2/token`, {
                    method: "POST",
                    body: data,
                });
                return Response.json(await res.json());
            },
        },
    },
});
