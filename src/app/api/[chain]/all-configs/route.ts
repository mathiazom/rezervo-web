import { createGenericEndpoint } from "@/lib/helpers/api";

export const GET = createGenericEndpoint("GET", "all-configs", { withChainIdentifier: true });
