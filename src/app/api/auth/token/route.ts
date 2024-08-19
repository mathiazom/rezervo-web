import { requireServerEnv } from "@/lib/helpers/env";

export const POST = async (req: Request) => {
    const data = await req.formData();
    data.set("client_secret", requireServerEnv("FUSIONAUTH_CLIENT_SECRET"));
    const res = await fetch(`${requireServerEnv("FUSIONAUTH_URL")}/oauth2/token`, {
        method: "POST",
        body: data,
    });
    return Response.json(await res.json());
};
