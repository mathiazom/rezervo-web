import { createGenericEndpoint } from "@/lib/helpers/api";

export const PUT = createGenericEndpoint("PUT", "user/totp", { withChainIdentifier: true });
