import { createGenericEndpoint } from "@/lib/helpers/api";

export const PUT = createGenericEndpoint("PUT", "user/me/avatar", { checkUserIsMe: true, useFormData: true });

export const DELETE = createGenericEndpoint("DELETE", "user/me/avatar", { checkUserIsMe: true });
