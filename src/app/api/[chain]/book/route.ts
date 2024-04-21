import { createGenericEndpoint } from "@/lib/helpers/api";

export const POST = createGenericEndpoint("POST", "book", { withChainIdentifier: true });
