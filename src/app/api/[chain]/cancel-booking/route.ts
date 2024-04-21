import { createGenericEndpoint } from "@/lib/helpers/api";

export const POST = createGenericEndpoint("POST", "cancel-booking", { withChainIdentifier: true });
