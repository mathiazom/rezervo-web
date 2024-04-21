import { createGenericEndpoint } from "@/lib/helpers/api";

export const GET = createGenericEndpoint("GET", "sessions-index", { withChainIdentifier: true });
