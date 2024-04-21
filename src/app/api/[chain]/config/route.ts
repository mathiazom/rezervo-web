import { createGenericEndpoint } from "@/lib/helpers/api";

export const GET = createGenericEndpoint("GET", "config", { withChainIdentifier: true });

export const PUT = createGenericEndpoint("PUT", "config", { withChainIdentifier: true });
