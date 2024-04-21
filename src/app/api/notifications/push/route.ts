import { createGenericEndpoint } from "@/lib/helpers/api";

export const PUT = createGenericEndpoint("PUT", "notifications/push");

export const DELETE = createGenericEndpoint("DELETE", "notifications/push");
