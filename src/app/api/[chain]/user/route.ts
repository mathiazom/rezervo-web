import { createGenericEndpoint } from "@/lib/helpers/api";

export const GET = createGenericEndpoint("GET", "user", { withChainIdentifier: true });

export const PUT = createGenericEndpoint("PUT", "user", { withChainIdentifier: true });
